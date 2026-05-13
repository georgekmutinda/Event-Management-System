using AutoMapper;
using Application.DTOs;
using Domain.Entities;

namespace Application.Mappings
{
    /// <summary>
    /// AutoMapper profile for User entity mappings.
    /// Defines mappings between User entity and User DTOs.
    /// </summary>
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // Map User entity to UserResponseDto
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId));

            // Map UpdateUserDto to User entity
            // Only maps non-null values - partial updates
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
