using System.Security.Claims;
using Application.DTOs;
using Domain.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventManagementApi.Controllers
{
    [Authorize(Roles = "Planner")]
    [ApiController]
    [Route("api/planner")]
    public class PlannerController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PlannerController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("events")]
        public async Task<ActionResult<List<PlannerEventSummaryDto>>> GetMyEvents()
        {
            var plannerId = GetCurrentUserId();

            var events = await _db.Event
                .Where(item => item.PlannerId == plannerId)
                .Select(item => new PlannerEventSummaryDto
                {
                    EventId = item.EventId,
                    Title = item.Title,
                    Location = item.Location,
                    EventDate = item.EventDate,
                    TicketPrice = item.TicketPrice,
                    PaidRegistrations = item.Registrations.Count(registration => registration.PaymentStatus == "Completed"),
                    VendorCount = item.EventVendors.Count,
                    ServiceProviderCount = item.EventServices.Count
                })
                .OrderBy(item => item.EventDate)
                .ToListAsync();

            return Ok(events);
        }

        [HttpGet("paid-registrations")]
        public async Task<ActionResult<List<PlannerPaidRegistrationDto>>> GetPaidRegistrations()
        {
            var plannerId = GetCurrentUserId();

            var registrations = await _db.EventRegistration
                .Where(item => item.Event.PlannerId == plannerId && item.PaymentStatus == "Completed")
                .Select(item => new PlannerPaidRegistrationDto
                {
                    RegistrationId = item.RegistrationId,
                    EventId = item.EventId,
                    EventTitle = item.Event.Title,
                    AttendeeId = item.AttendeeId,
                    AttendeeName = item.Attendee.FullName,
                    AttendeeEmail = item.Attendee.Email,
                    TicketType = item.TicketType,
                    PaymentStatus = item.PaymentStatus,
                    AmountPaid = _db.Payment
                        .Where(payment => payment.EventId == item.EventId && payment.UserId == item.AttendeeId && payment.PaymentStatus == "Completed")
                        .OrderByDescending(payment => payment.PaymentDate)
                        .Select(payment => payment.Amount)
                        .FirstOrDefault(),
                    RegisteredAt = item.RegisteredAt
                })
                .OrderByDescending(item => item.RegisteredAt)
                .ToListAsync();

            return Ok(registrations);
        }

        [HttpGet("vendors")]
        public async Task<ActionResult<List<PlannerVendorDto>>> GetVendors()
        {
            var plannerId = GetCurrentUserId();

            var vendors = await _db.EventVendor
                .Where(item => item.Event.PlannerId == plannerId)
                .GroupBy(item => new { item.VendorId, item.Vendor.BusinessName, item.Vendor.ProductType, item.Vendor.Description })
                .Select(group => new PlannerVendorDto
                {
                    VendorId = group.Key.VendorId,
                    BusinessName = group.Key.BusinessName,
                    ProductType = group.Key.ProductType,
                    Description = group.Key.Description,
                    EventCount = group.Select(item => item.EventId).Distinct().Count()
                })
                .OrderBy(item => item.BusinessName)
                .ToListAsync();

            return Ok(vendors);
        }

        [HttpGet("service-providers")]
        public async Task<ActionResult<List<PlannerServiceProviderDto>>> GetServiceProviders()
        {
            var plannerId = GetCurrentUserId();

            var providers = await _db.EventService
                .Where(item => item.Event.PlannerId == plannerId)
                .GroupBy(item => new { item.ProviderId, item.Provider.CompanyName, item.Provider.ServiceType, item.Provider.Description })
                .Select(group => new PlannerServiceProviderDto
                {
                    ProviderId = group.Key.ProviderId,
                    CompanyName = group.Key.CompanyName,
                    ServiceType = group.Key.ServiceType,
                    Description = group.Key.Description,
                    EventCount = group.Select(item => item.EventId).Distinct().Count()
                })
                .OrderBy(item => item.CompanyName)
                .ToListAsync();

            return Ok(providers);
        }

        private int GetCurrentUserId()
        {
            var value = User.FindFirstValue("userId");
            return int.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
