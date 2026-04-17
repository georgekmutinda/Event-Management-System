using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing user operations.
    /// Implements IUserService with business logic for user CRUD operations.
    /// Uses repository pattern and AutoMapper for clean separation of concerns.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<List<UserResponseDto>>(users);
        }

        public async Task<UserResponseDto> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            
            if (user == null)
                throw new Exception($"User with email '{email}' not found");

            return _mapper.Map<UserResponseDto>(user);
        }

        public async Task<UserResponseDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
                throw new Exception($"User with ID '{id}' not found");

            return _mapper.Map<UserResponseDto>(user);
        }

        public async Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            // 1. Fetch user by ID
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
                throw new Exception($"User with ID '{id}' not found");

            // 2. Check if new email is unique (if email is being updated)
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingUser != null)
                    throw new Exception($"Email '{dto.Email}' is already in use");
            }

            // 3. Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            // 4. Save changes
            await _userRepository.UpdateAsync(user);

            // 5. Return updated user as DTO
            return _mapper.Map<UserResponseDto>(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            
            if (user == null)
                return false;

            await _userRepository.DeleteAsync(user);
            return true;
        }
    }
}
