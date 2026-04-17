using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing event operations.
    /// Implements IEventService with business logic for event CRUD operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// </summary>
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public EventService(IEventRepository eventRepository, IUserRepository userRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Creates a new event.
        /// Validates that the planner (user) exists before creating.
        /// </summary>
        public async Task<EventResponseDto> CreateEventAsync(EventRequestDto dto)
        {
            // Validate that planner exists
            var planner = await _userRepository.GetByIdAsync(dto.PlannerId);
            if (planner == null)
                throw new Exception($"Planner with ID '{dto.PlannerId}' not found");

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new Exception("Event title is required");

            if (string.IsNullOrWhiteSpace(dto.Location))
                throw new Exception("Event location is required");

            // Map DTO to entity
            var eventEntity = _mapper.Map<Event>(dto);

            // Add to repository
            await _eventRepository.AddAsync(eventEntity);

            // Return mapped response
            return _mapper.Map<EventResponseDto>(eventEntity);
        }

        /// <summary>
        /// Retrieves all events from the system.
        /// </summary>
        public async Task<List<EventResponseDto>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            return _mapper.Map<List<EventResponseDto>>(events);
        }

        /// <summary>
        /// Retrieves a single event by ID.
        /// Throws exception if event not found.
        /// </summary>
        public async Task<EventResponseDto> GetEventByIdAsync(int id)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(id);
            
            if (eventEntity == null)
                throw new Exception($"Event with ID '{id}' not found");

            return _mapper.Map<EventResponseDto>(eventEntity);
        }

        /// <summary>
        /// Updates an existing event.
        /// Only updates fields that are provided (non-null).
        /// Validates that planner exists if PlannerId is being updated.
        /// </summary>
        public async Task<EventResponseDto> UpdateEventAsync(int id, EventRequestDto dto)
        {
            // 1. Fetch event by ID
            var eventEntity = await _eventRepository.GetByIdAsync(id);
            
            if (eventEntity == null)
                throw new Exception($"Event with ID '{id}' not found");

            // 2. Validate new planner exists (if PlannerId is being changed)
            if (dto.PlannerId != eventEntity.PlannerId)
            {
                var newPlanner = await _userRepository.GetByIdAsync(dto.PlannerId);
                if (newPlanner == null)
                    throw new Exception($"Planner with ID '{dto.PlannerId}' not found");
            }

            // 3. Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.Title))
                eventEntity.Title = dto.Title;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                eventEntity.Description = dto.Description;

            if (!string.IsNullOrWhiteSpace(dto.Location))
                eventEntity.Location = dto.Location;

            if (dto.EventDate != default(DateTime))
                eventEntity.EventDate = dto.EventDate;

            eventEntity.PlannerId = dto.PlannerId;

            // 4. Save changes
            await _eventRepository.UpdateAsync(eventEntity);

            // 5. Return updated event as DTO
            return _mapper.Map<EventResponseDto>(eventEntity);
        }

        /// <summary>
        /// Deletes an event by ID.
        /// Returns true if successful, false if event not found.
        /// </summary>
        public async Task<bool> DeleteEventAsync(int id)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(id);
            
            if (eventEntity == null)
                return false;

            await _eventRepository.DeleteAsync(eventEntity);
            return true;
        }
    }
}
