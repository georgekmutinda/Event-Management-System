using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing event service operations.
    /// Implements IEventServiceService with business logic for event service CRUD operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// </summary>
    public class EventServiceService : IEventServiceService
    {
        private readonly IEventServiceRepository _repository;
        private readonly IEventRepository _eventRepository;
        private readonly IServiceProviderRepository _providerRepository;
        private readonly IMapper _mapper;

        public EventServiceService(
            IEventServiceRepository repository,
            IEventRepository eventRepository,
            IServiceProviderRepository providerRepository,
            IMapper mapper)
        {
            _repository = repository;
            _eventRepository = eventRepository;
            _providerRepository = providerRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Creates a new event service.
        /// Validates that both event and service provider exist before creating.
        /// </summary>
        public async Task<EventServiceResponseDto> CreateAsync(CreateEventServiceDto dto)
        {
            // Validate that event exists
            var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with ID '{dto.EventId}' not found");

            // Validate that service provider exists
            var provider = await _providerRepository.GetByIdAsync(dto.ProviderId);
            if (provider == null)
                throw new Exception($"Service provider with ID '{dto.ProviderId}' not found");

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.ServiceDetails))
                throw new Exception("Service details are required");

            // Map DTO to entity
            var svc = _mapper.Map<Domain.Entities.EventService>(dto);
            svc.Status = "Pending"; // Default status

            // Add to repository
            await _repository.AddAsync(svc);

            // Return mapped response
            return _mapper.Map<EventServiceResponseDto>(svc);
        }

        /// <summary>
        /// Retrieves all event services from the system.
        /// </summary>
        public async Task<List<EventServiceResponseDto>> GetAllAsync()
        {
            var eventServices = await _repository.GetAllAsync();
            return _mapper.Map<List<EventServiceResponseDto>>(eventServices);
        }

        /// <summary>
        /// Deletes an event service by ID.
        /// </summary>
        public async Task DeleteAsync(int id)
        {
            var eventServices = await _repository.GetAllAsync();
            var service = eventServices.FirstOrDefault(es => es.EventServiceId == id);

            if (service == null)
                throw new Exception($"Event service with ID '{id}' not found");

            await _repository.DeleteAsync(id);
        }
    }
}
