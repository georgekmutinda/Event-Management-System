using System.Security.Claims;
using Application.DTOs;
using Domain.Data;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventManagementApi.Controllers
{
    [ApiController]
    [Route("api/portal")]
    public class PortalController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PortalController(AppDbContext db)
        {
            _db = db;
        }

        [Authorize(Roles = "Vendor")]
        [HttpGet("vendor/dashboard")]
        public async Task<ActionResult<VendorDashboardDto>> GetVendorDashboard()
        {
            var vendor = await FindOrCreateVendorForCurrentUserAsync();
            if (vendor == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var vendorId = vendor.VendorId;

            var assignments = await _db.EventVendor
                .Where(ev => ev.VendorId == vendorId)
                .Include(ev => ev.Event)
                .ThenInclude(e => e.Planner)
                .ToListAsync();

            var eventCount = assignments.Select(x => x.EventId).Distinct().Count();
            var approvedCount = assignments.Count(x => string.Equals(x.Status, "Approved", StringComparison.OrdinalIgnoreCase));
            var pendingCount = assignments.Count(x => string.Equals(x.Status, "Pending", StringComparison.OrdinalIgnoreCase));
            var revenuePotential = assignments
                .Where(x => x.Event != null)
                .Sum(x => x.Event?.TicketPrice ?? 0);

            var recentEvents = assignments
                .Where(x => x.Event != null)
                .OrderByDescending(x => x.Event.EventDate)
                .Take(5)
                .Select(x => new VendorAssignmentDto
                {
                    AssignmentId = x.EventVendorId,
                    EventId = x.EventId,
                    EventTitle = x.Event.Title,
                    EventDate = x.Event.EventDate,
                    Location = x.Event.Location,
                    Status = x.Status,
                    PlannerName = x.Event.Planner.FullName
                })
                .ToList();

            return Ok(new VendorDashboardDto
            {
                AssignedEvents = assignments.Count,
                UniqueEvents = eventCount,
                ApprovedAssignments = approvedCount,
                PendingAssignments = pendingCount,
                RevenuePotential = revenuePotential,
                RecentAssignments = recentEvents
            });
        }

        [Authorize(Roles = "Vendor")]
        [HttpGet("vendor/assignments")]
        public async Task<ActionResult<List<VendorAssignmentDto>>> GetVendorAssignments()
        {
            var vendor = await FindOrCreateVendorForCurrentUserAsync();
            if (vendor == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var vendorId = vendor.VendorId;

            var assignments = await _db.EventVendor
                .Where(ev => ev.VendorId == vendorId)
                .Include(ev => ev.Event)
                .ThenInclude(e => e.Planner)
                .OrderByDescending(ev => ev.Event.EventDate)
                .Select(ev => new VendorAssignmentDto
                {
                    AssignmentId = ev.EventVendorId,
                    EventId = ev.EventId,
                    EventTitle = ev.Event.Title,
                    EventDate = ev.Event.EventDate,
                    Location = ev.Event.Location,
                    Status = ev.Status,
                    PlannerName = ev.Event.Planner.FullName
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [Authorize(Roles = "Vendor")]
        [HttpPost("vendor/bids")]
        public async Task<ActionResult<VendorAssignmentDto>> CreateVendorBid([FromBody] PortalBidDto dto)
        {
            var vendor = await FindOrCreateVendorForCurrentUserAsync();
            if (vendor == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var eventEntity = await _db.Event
                .Include(item => item.Planner)
                .FirstOrDefaultAsync(item => item.EventId == dto.EventId);
            if (eventEntity == null)
                return BadRequest(new { message = $"Event with ID '{dto.EventId}' not found." });

            var exists = await _db.EventVendor.AnyAsync(item => item.EventId == dto.EventId && item.VendorId == vendor.VendorId);
            if (exists)
                return BadRequest(new { message = "You already have an assignment or bid for this event." });

            var bid = new EventVendor
            {
                EventId = dto.EventId,
                VendorId = vendor.VendorId,
                Status = "Bid"
            };

            _db.EventVendor.Add(bid);
            await _db.SaveChangesAsync();

            return Ok(new VendorAssignmentDto
            {
                AssignmentId = bid.EventVendorId,
                EventId = bid.EventId,
                EventTitle = eventEntity.Title,
                EventDate = eventEntity.EventDate,
                Location = eventEntity.Location,
                Status = bid.Status,
                PlannerName = eventEntity.Planner.FullName
            });
        }

        [Authorize(Roles = "Vendor")]
        [HttpGet("vendor/profile")]
        public async Task<ActionResult<VendorProfileDto>> GetVendorProfile()
        {
            var vendor = await FindOrCreateVendorForCurrentUserAsync(includeUser: true);

            if (vendor == null)
                return Unauthorized(new { message = "User could not be resolved." });

            return Ok(new VendorProfileDto
            {
                VendorId = vendor.VendorId,
                BusinessName = vendor.BusinessName,
                ProductType = vendor.ProductType,
                Description = vendor.Description,
                PhotoUrl = vendor.PhotoUrl,
                AverageRating = vendor.AverageRating,
                TotalReviews = vendor.TotalReviews,
                Recommendations = vendor.Recommendations,
                Email = vendor.User?.Email,
                FullName = vendor.User?.FullName,
                AssignedEventCount = await _db.EventVendor.CountAsync(ev => ev.VendorId == vendor.VendorId)
            });
        }

        [Authorize(Roles = "Vendor")]
        [HttpPut("vendor/profile/photo")]
        public async Task<ActionResult<VendorProfileDto>> UpdateVendorProfilePhoto([FromBody] PortalPhotoUpdateDto dto)
        {
            var vendor = await FindOrCreateVendorForCurrentUserAsync(includeUser: true);
            if (vendor == null)
                return Unauthorized(new { message = "User could not be resolved." });

            vendor.PhotoUrl = string.IsNullOrWhiteSpace(dto.PhotoUrl) ? null : dto.PhotoUrl.Trim();
            await _db.SaveChangesAsync();

            return await GetVendorProfile();
        }

        [Authorize(Roles = "ServiceProvider")]
        [HttpGet("provider/dashboard")]
        public async Task<ActionResult<ProviderDashboardDto>> GetProviderDashboard()
        {
            var provider = await FindOrCreateProviderForCurrentUserAsync();
            if (provider == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var providerId = provider.ProviderId;

            var assignments = await _db.EventService
                .Where(es => es.ProviderId == providerId)
                .Include(es => es.Event)
                .ThenInclude(e => e.Planner)
                .ToListAsync();

            var uniqueEvents = assignments.Select(x => x.EventId).Distinct().Count();
            var approvedCount = assignments.Count(x => string.Equals(x.Status, "Approved", StringComparison.OrdinalIgnoreCase));
            var pendingCount = assignments.Count(x => string.Equals(x.Status, "Pending", StringComparison.OrdinalIgnoreCase));

            var recentServices = assignments
                .Where(x => x.Event != null)
                .OrderByDescending(x => x.Event.EventDate)
                .Take(5)
                .Select(x => new ProviderServiceDto
                {
                    ServiceId = x.EventServiceId,
                    EventId = x.EventId,
                    EventTitle = x.Event.Title,
                    EventDate = x.Event.EventDate,
                    ServiceDetails = x.ServiceDetails,
                    Status = x.Status,
                    PlannerName = x.Event.Planner.FullName
                })
                .ToList();

            return Ok(new ProviderDashboardDto
            {
                AssignedServices = assignments.Count,
                UniqueEvents = uniqueEvents,
                ApprovedServices = approvedCount,
                PendingServices = pendingCount,
                RecentServices = recentServices
            });
        }

        [Authorize(Roles = "ServiceProvider")]
        [HttpGet("provider/services")]
        public async Task<ActionResult<List<ProviderServiceDto>>> GetProviderServices()
        {
            var provider = await FindOrCreateProviderForCurrentUserAsync();
            if (provider == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var providerId = provider.ProviderId;

            var services = await _db.EventService
                .Where(es => es.ProviderId == providerId)
                .Include(es => es.Event)
                .ThenInclude(e => e.Planner)
                .OrderByDescending(es => es.Event.EventDate)
                .Select(es => new ProviderServiceDto
                {
                    ServiceId = es.EventServiceId,
                    EventId = es.EventId,
                    EventTitle = es.Event.Title,
                    EventDate = es.Event.EventDate,
                    ServiceDetails = es.ServiceDetails,
                    Status = es.Status,
                    PlannerName = es.Event.Planner.FullName
                })
                .ToListAsync();

            return Ok(services);
        }

        [Authorize(Roles = "ServiceProvider")]
        [HttpPost("provider/bids")]
        public async Task<ActionResult<ProviderServiceDto>> CreateProviderBid([FromBody] PortalBidDto dto)
        {
            var provider = await FindOrCreateProviderForCurrentUserAsync();
            if (provider == null)
                return Unauthorized(new { message = "User could not be resolved." });

            var eventEntity = await _db.Event
                .Include(item => item.Planner)
                .FirstOrDefaultAsync(item => item.EventId == dto.EventId);
            if (eventEntity == null)
                return BadRequest(new { message = $"Event with ID '{dto.EventId}' not found." });

            var exists = await _db.EventService.AnyAsync(item => item.EventId == dto.EventId && item.ProviderId == provider.ProviderId);
            if (exists)
                return BadRequest(new { message = "You already have an assigned service or bid for this event." });

            var bid = new EventService
            {
                EventId = dto.EventId,
                ProviderId = provider.ProviderId,
                ServiceDetails = string.IsNullOrWhiteSpace(dto.ServiceDetails)
                    ? $"Bid from {provider.CompanyName}"
                    : dto.ServiceDetails.Trim(),
                Status = "Bid"
            };

            _db.EventService.Add(bid);
            await _db.SaveChangesAsync();

            return Ok(new ProviderServiceDto
            {
                ServiceId = bid.EventServiceId,
                EventId = bid.EventId,
                EventTitle = eventEntity.Title,
                EventDate = eventEntity.EventDate,
                ServiceDetails = bid.ServiceDetails,
                Status = bid.Status,
                PlannerName = eventEntity.Planner.FullName
            });
        }

        [Authorize(Roles = "ServiceProvider")]
        [HttpGet("provider/profile")]
        public async Task<ActionResult<ProviderProfileDto>> GetProviderProfile()
        {
            var provider = await FindOrCreateProviderForCurrentUserAsync(includeUser: true);

            if (provider == null)
                return Unauthorized(new { message = "User could not be resolved." });

            return Ok(new ProviderProfileDto
            {
                ProviderId = provider.ProviderId,
                CompanyName = provider.CompanyName,
                ServiceType = provider.ServiceType,
                Description = provider.Description,
                PhotoUrl = provider.PhotoUrl,
                Email = provider.User?.Email,
                FullName = provider.User?.FullName,
                AssignedServiceCount = await _db.EventService.CountAsync(es => es.ProviderId == provider.ProviderId)
            });
        }

        [Authorize(Roles = "ServiceProvider")]
        [HttpPut("provider/profile/photo")]
        public async Task<ActionResult<ProviderProfileDto>> UpdateProviderProfilePhoto([FromBody] PortalPhotoUpdateDto dto)
        {
            var provider = await FindOrCreateProviderForCurrentUserAsync(includeUser: true);
            if (provider == null)
                return Unauthorized(new { message = "User could not be resolved." });

            provider.PhotoUrl = string.IsNullOrWhiteSpace(dto.PhotoUrl) ? null : dto.PhotoUrl.Trim();
            await _db.SaveChangesAsync();

            return await GetProviderProfile();
        }

        private async Task<Vendor?> FindOrCreateVendorForCurrentUserAsync(bool includeUser = false)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
                return null;

            var query = _db.Vendor.AsQueryable();
            if (includeUser)
                query = query.Include(v => v.User);

            var vendor = await query.FirstOrDefaultAsync(v => v.UserId == userId);
            if (vendor != null)
                return vendor;

            var user = await _db.User.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return null;

            vendor = new Vendor
            {
                UserId = user.UserId,
                BusinessName = string.IsNullOrWhiteSpace(user.FullName) ? "Vendor Workspace" : user.FullName,
                ProductType = "General",
                Description = "Vendor profile pending setup."
            };

            _db.Vendor.Add(vendor);
            await _db.SaveChangesAsync();

            if (includeUser)
                vendor.User = user;

            return vendor;
        }

        private async Task<ServiceProviderProfile?> FindOrCreateProviderForCurrentUserAsync(bool includeUser = false)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
                return null;

            var query = _db.ServiceProviderProfile.AsQueryable();
            if (includeUser)
                query = query.Include(p => p.User);

            var provider = await query.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider != null)
                return provider;

            var user = await _db.User.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return null;

            provider = new ServiceProviderProfile
            {
                UserId = user.UserId,
                CompanyName = string.IsNullOrWhiteSpace(user.FullName) ? "Service Provider Workspace" : user.FullName,
                ServiceType = "General",
                Description = "Service provider profile pending setup."
            };

            _db.ServiceProviderProfile.Add(provider);
            await _db.SaveChangesAsync();

            if (includeUser)
                provider.User = user;

            return provider;
        }

        private int GetCurrentUserId()
        {
            var value = User.FindFirstValue("userId");
            return int.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
