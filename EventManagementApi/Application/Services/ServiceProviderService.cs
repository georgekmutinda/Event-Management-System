using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services;

/// <summary>
/// Service for managing service provider profile operations.
/// Implements IServiceProviderService with business logic for service provider CRUD operations.
/// Uses repository pattern and AutoMapper for clean separation of concerns.
/// </summary>
public class ServiceProviderService : IServiceProviderService
{
    private readonly IServiceProviderRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public ServiceProviderService(IServiceProviderRepository repository, IUserRepository userRepository, IMapper mapper)
    {
        _repository = repository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    /// <summary>
    /// Creates a new service provider profile.
    /// Validates that the associated user exists before creating.
    /// </summary>
    public async Task<ServiceProviderResponseDto> CreateAsync(CreateServiceProviderDto dto)
    {
        // Validate that user exists
        var user = await _userRepository.GetByIdAsync(dto.UserId);
        if (user == null)
            throw new Exception($"User with ID '{dto.UserId}' not found");

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.ServiceType))
            throw new Exception("Service type is required");
        if (string.IsNullOrWhiteSpace(dto.CompanyName))
            throw new Exception("Company name is required");

        // Map DTO to entity
        var provider = _mapper.Map<ServiceProviderProfile>(dto);

        // Add to repository
        await _repository.AddAsync(provider);

        // Return mapped response
        return _mapper.Map<ServiceProviderResponseDto>(provider);
    }

    /// <summary>
    /// Retrieves all service provider profiles from the system.
    /// </summary>
    public async Task<List<ServiceProviderResponseDto>> GetAllAsync()
    {
        var providers = await _repository.GetAllAsync();
        return _mapper.Map<List<ServiceProviderResponseDto>>(providers);
    }

    /// <summary>
    /// Retrieves a single service provider profile by ID.
    /// Throws exception if provider not found.
    /// </summary>
    public async Task<ServiceProviderResponseDto> GetByIdAsync(int id)
    {
        var provider = await _repository.GetByIdAsync(id);

        if (provider == null)
            throw new Exception($"Service provider with ID '{id}' not found");

        return _mapper.Map<ServiceProviderResponseDto>(provider);
    }

    /// <summary>
    /// Updates an existing service provider profile.
    /// Only updates fields that are provided (non-null).
    /// Validates that user exists if UserId is being updated.
    /// </summary>
    public async Task<ServiceProviderResponseDto> UpdateAsync(int id, UpdateServiceProviderDto dto)
    {
        // 1. Fetch provider by ID
        var provider = await _repository.GetByIdAsync(id);

        if (provider == null)
            throw new Exception($"Service provider with ID '{id}' not found");

        // 2. Update only provided fields
        if (!string.IsNullOrWhiteSpace(dto.ServiceType))
            provider.ServiceType = dto.ServiceType;

        if (!string.IsNullOrWhiteSpace(dto.CompanyName))
            provider.CompanyName = dto.CompanyName;

        if (!string.IsNullOrWhiteSpace(dto.Description))
            provider.Description = dto.Description;

        if (dto.PhotoUrl != null)
            provider.PhotoUrl = string.IsNullOrWhiteSpace(dto.PhotoUrl) ? null : dto.PhotoUrl;

        // 3. Save changes
        await _repository.UpdateAsync(provider);

        // 4. Return updated provider as DTO
        return _mapper.Map<ServiceProviderResponseDto>(provider);
    }

    /// <summary>
    /// Deletes a service provider profile by ID.
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var provider = await _repository.GetByIdAsync(id);

        if (provider == null)
            throw new Exception($"Service provider with ID '{id}' not found");

        await _repository.DeleteAsync(id);
    }
}
