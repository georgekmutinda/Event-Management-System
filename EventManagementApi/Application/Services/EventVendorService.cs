using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing event-vendor associations.
    /// Implements IEventVendorService with business logic for event-vendor relationships.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// Prevents duplicate vendor assignments to the same event.
    /// </summary>
    public class EventVendorService : IEventVendorService
    {
        private readonly IEventVendorRepository _eventVendorRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IVendorRepository _vendorRepository;
        private readonly IMapper _mapper;

        public EventVendorService(
            IEventVendorRepository eventVendorRepository,
            IEventRepository eventRepository,
            IVendorRepository vendorRepository,
            IMapper mapper)
        {
            _eventVendorRepository = eventVendorRepository;
            _eventRepository = eventRepository;
            _vendorRepository = vendorRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Links a vendor to an event.
        /// Validates that event and vendor exist.
        /// Prevents duplicate associations (same event + vendor combination).
        /// </summary>
        public async Task<EventVendorResponseDto> CreateAsync(EventVendorRequestDto dto)
        {
            // Validate event exists
            var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with ID '{dto.EventId}' not found");

            // Validate vendor exists
            var vendor = await _vendorRepository.GetByIdAsync(dto.VendorId);
            if (vendor == null)
                throw new Exception($"Vendor with ID '{dto.VendorId}' not found");

            // Check for duplicate association
            var existingAssociation = await _eventVendorRepository.GetByEventAndVendorAsync(dto.EventId, dto.VendorId);
            if (existingAssociation != null)
                throw new Exception($"Vendor with ID '{dto.VendorId}' is already associated with Event with ID '{dto.EventId}'");

            // Create event-vendor entity with default status
            var eventVendor = new EventVendor
            {
                EventId = dto.EventId,
                VendorId = dto.VendorId,
                Status = "Pending"
            };

            // Add to repository
            await _eventVendorRepository.AddAsync(eventVendor);

            // Return mapped response
            return _mapper.Map<EventVendorResponseDto>(eventVendor);
        }

        /// <summary>
        /// Retrieves all event-vendor associations from the system.
        /// </summary>
        public async Task<List<EventVendorResponseDto>> GetAllAsync()
        {
            var associations = await _eventVendorRepository.GetAllAsync();
            return _mapper.Map<List<EventVendorResponseDto>>(associations);
        }

        /// <summary>
        /// Deletes an event-vendor association by ID.
        /// Returns true if successful, false if association not found.
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var association = await _eventVendorRepository.GetByIdAsync(id);
            
            if (association == null)
                return false;

            await _eventVendorRepository.DeleteAsync(association);
            return true;
        }
    }
}
