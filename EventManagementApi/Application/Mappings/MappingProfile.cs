using AutoMapper;
using Application.DTOs;
using Domain.Entities;

namespace Application.Mappings
{
    /// <summary>
    /// AutoMapper profile for all entity mappings.
    /// Consolidates mappings for User, Event, and Role entities.
    /// Defines how entities convert to DTOs and vice versa.
    /// </summary>
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // =========================
            // USER MAPPINGS
            // =========================
            
            // User → UserResponseDto
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId));

            // UpdateUserDto → User (partial updates only)
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // =========================
            // EVENT MAPPINGS
            // =========================

            // Event → EventResponseDto
            CreateMap<Event, EventResponseDto>();

            // EventRequestDto → Event
            CreateMap<EventRequestDto, Event>();

            // =========================
            // ROLE MAPPINGS
            // =========================

            // Role → RoleResponseDto
            CreateMap<Role, RoleResponseDto>();

            // RoleRequestDto → Role
            CreateMap<RoleRequestDto, Role>();

            // =========================
            // EVENT REGISTRATION MAPPINGS
            // =========================

            // EventRegistration → EventRegistrationResponseDto
            CreateMap<EventRegistration, EventRegistrationResponseDto>();

            // EventRegistrationRequestDto → EventRegistration
            CreateMap<EventRegistrationRequestDto, EventRegistration>();

            // =========================
            // VENDOR MAPPINGS
            // =========================

            // Vendor → VendorResponseDto
            CreateMap<Vendor, VendorResponseDto>();

            // VendorRequestDto → Vendor
            CreateMap<VendorRequestDto, Vendor>();

            // =========================
            // EVENT VENDOR MAPPINGS
            // =========================

            // EventVendor → EventVendorResponseDto
            CreateMap<EventVendor, EventVendorResponseDto>();

            // EventVendorRequestDto → EventVendor
            CreateMap<EventVendorRequestDto, EventVendor>();

            // =========================
            // SERVICE PROVIDER MAPPINGS
            // =========================

            // ServiceProviderProfile → ServiceProviderResponseDto
            CreateMap<ServiceProviderProfile, ServiceProviderResponseDto>();

            // CreateServiceProviderDto → ServiceProviderProfile
            CreateMap<CreateServiceProviderDto, ServiceProviderProfile>();

            // UpdateServiceProviderDto → ServiceProviderProfile (partial updates only)
            CreateMap<UpdateServiceProviderDto, ServiceProviderProfile>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // =========================
            // EVENT SERVICE MAPPINGS
            // =========================

            // EventService → EventServiceResponseDto
            CreateMap<EventService, EventServiceResponseDto>();

            // CreateEventServiceDto → EventService
            CreateMap<CreateEventServiceDto, EventService>();

            // =========================
            // PAYMENT MAPPINGS
            // =========================

            // Payment → PaymentResponseDto
            CreateMap<Payment, PaymentResponseDto>();

            // CreatePaymentDto → Payment
            CreateMap<CreatePaymentDto, Payment>();
        }
    }
}
