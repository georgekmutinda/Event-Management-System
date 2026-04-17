using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing event registration operations.
    /// Implements IEventRegistrationService with business logic for event registration operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// Prevents duplicate registrations for the same event and user.
    /// </summary>
    public class EventRegistrationService : IEventRegistrationService
    {
        private readonly IEventRegistrationRepository _registrationRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public EventRegistrationService(
            IEventRegistrationRepository registrationRepository,
            IEventRepository eventRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _registrationRepository = registrationRepository;
            _eventRepository = eventRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Registers a user for an event.
        /// Validates that event and user (attendee) exist.
        /// Prevents duplicate registrations (same event + attendee combination).
        /// </summary>
        public async Task<EventRegistrationResponseDto> RegisterAsync(EventRegistrationRequestDto dto)
        {
            // Validate event exists
            var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with ID '{dto.EventId}' not found");

            // Validate user (attendee) exists
            var attendee = await _userRepository.GetByIdAsync(dto.AttendeeId);
            if (attendee == null)
                throw new Exception($"User with ID '{dto.AttendeeId}' not found");

            // Check for duplicate registration
            var existingRegistration = await _registrationRepository.GetByEventAndUserAsync(dto.EventId, dto.AttendeeId);
            if (existingRegistration != null)
                throw new Exception($"User with ID '{dto.AttendeeId}' is already registered for Event with ID '{dto.EventId}'");

            // Create registration entity with default values
            var registration = new EventRegistration
            {
                EventId = dto.EventId,
                AttendeeId = dto.AttendeeId,
                TicketType = "Standard",
                PaymentStatus = "Pending"
            };

            // Add to repository
            await _registrationRepository.AddAsync(registration);

            // Return mapped response
            return _mapper.Map<EventRegistrationResponseDto>(registration);
        }

        /// <summary>
        /// Retrieves all event registrations from the system.
        /// </summary>
        public async Task<List<EventRegistrationResponseDto>> GetAllAsync()
        {
            var registrations = await _registrationRepository.GetAllAsync();
            return _mapper.Map<List<EventRegistrationResponseDto>>(registrations);
        }

        /// <summary>
        /// Retrieves a single event registration by ID.
        /// Throws exception if registration not found.
        /// </summary>
        public async Task<EventRegistrationResponseDto> GetByIdAsync(int id)
        {
            var registration = await _registrationRepository.GetByIdAsync(id);
            
            if (registration == null)
                throw new Exception($"Event registration with ID '{id}' not found");

            return _mapper.Map<EventRegistrationResponseDto>(registration);
        }

        /// <summary>
        /// Deletes an event registration by ID.
        /// Returns true if successful, false if registration not found.
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var registration = await _registrationRepository.GetByIdAsync(id);
            
            if (registration == null)
                return false;

            await _registrationRepository.DeleteAsync(registration);
            return true;
        }
    }
}
