using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing vendor operations.
    /// Implements IVendorService with business logic for vendor CRUD operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// </summary>
    public class VendorService : IVendorService
    {
        private readonly IVendorRepository _vendorRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public VendorService(IVendorRepository vendorRepository, IUserRepository userRepository, IMapper mapper)
        {
            _vendorRepository = vendorRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Creates a new vendor.
        /// Validates that the associated user exists before creating.
        /// </summary>
        public async Task<VendorResponseDto> CreateAsync(VendorRequestDto dto)
        {
            // Validate that user exists
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null)
                throw new Exception($"User with ID '{dto.UserId}' not found");

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.BusinessName))
                throw new Exception("Vendor business name is required");

            // Map DTO to entity
            var vendor = _mapper.Map<Vendor>(dto);

            // Add to repository
            await _vendorRepository.AddAsync(vendor);

            // Return mapped response
            return _mapper.Map<VendorResponseDto>(vendor);
        }

        /// <summary>
        /// Retrieves all vendors from the system.
        /// </summary>
        public async Task<List<VendorResponseDto>> GetAllAsync()
        {
            var vendors = await _vendorRepository.GetAllAsync();
            return _mapper.Map<List<VendorResponseDto>>(vendors);
        }

        /// <summary>
        /// Retrieves a single vendor by ID.
        /// Throws exception if vendor not found.
        /// </summary>
        public async Task<VendorResponseDto> GetByIdAsync(int id)
        {
            var vendor = await _vendorRepository.GetByIdAsync(id);
            
            if (vendor == null)
                throw new Exception($"Vendor with ID '{id}' not found");

            return _mapper.Map<VendorResponseDto>(vendor);
        }

        /// <summary>
        /// Updates an existing vendor.
        /// Only updates fields that are provided (non-null).
        /// Validates that user exists if UserId is being updated.
        /// </summary>
        public async Task<VendorResponseDto> UpdateAsync(int id, VendorRequestDto dto)
        {
            // 1. Fetch vendor by ID
            var vendor = await _vendorRepository.GetByIdAsync(id);
            
            if (vendor == null)
                throw new Exception($"Vendor with ID '{id}' not found");

            // 2. Validate new user exists (if UserId is being changed)
            if (dto.UserId != vendor.UserId)
            {
                var newUser = await _userRepository.GetByIdAsync(dto.UserId);
                if (newUser == null)
                    throw new Exception($"User with ID '{dto.UserId}' not found");
            }

            // 3. Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.BusinessName))
                vendor.BusinessName = dto.BusinessName;

            if (!string.IsNullOrWhiteSpace(dto.ProductType))
                vendor.ProductType = dto.ProductType;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                vendor.Description = dto.Description;

            vendor.UserId = dto.UserId;

            // 4. Save changes
            await _vendorRepository.UpdateAsync(vendor);

            // 5. Return updated vendor as DTO
            return _mapper.Map<VendorResponseDto>(vendor);
        }

        /// <summary>
        /// Deletes a vendor by ID.
        /// Returns true if successful, false if vendor not found.
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var vendor = await _vendorRepository.GetByIdAsync(id);
            
            if (vendor == null)
                return false;

            await _vendorRepository.DeleteAsync(vendor);
            return true;
        }
    }
}
