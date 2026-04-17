using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing role operations.
    /// Implements IRoleService with business logic for role CRUD operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// </summary>
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IMapper _mapper;

        public RoleService(IRoleRepository roleRepository, IMapper mapper)
        {
            _roleRepository = roleRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Retrieves all roles from the system.
        /// </summary>
        public async Task<List<RoleResponseDto>> GetAllRolesAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            return _mapper.Map<List<RoleResponseDto>>(roles);
        }

        /// <summary>
        /// Creates a new role with a unique name.
        /// Throws exception if role name already exists.
        /// </summary>
        public async Task<RoleResponseDto> CreateRoleAsync(RoleRequestDto dto)
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.RoleName))
                throw new Exception("Role name is required");

            // Check for duplicate role name (case-insensitive)
            var existingRole = await _roleRepository.GetByNameAsync(dto.RoleName);
            if (existingRole != null)
                throw new Exception($"Role '{dto.RoleName}' already exists");

            // Map DTO to entity
            var role = _mapper.Map<Role>(dto);

            // Add to repository
            await _roleRepository.AddAsync(role);

            // Return mapped response
            return _mapper.Map<RoleResponseDto>(role);
        }

        /// <summary>
        /// Deletes a role by ID.
        /// Returns true if successful, false if role not found.
        /// WARNING: This will fail if users are assigned to this role 
        /// (depending on database constraints).
        /// </summary>
        public async Task<bool> DeleteRoleAsync(int id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            
            if (role == null)
                return false;

            await _roleRepository.DeleteAsync(role);
            return true;
        }
    }
}
