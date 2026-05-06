using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services;

public class InvitationService : IInvitationService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Planner",
        "Vendor",
        "ServiceProvider",
        "Attendee",
        "Admin"
    };

    private readonly IInvitationRepository _invitationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;
    private readonly IRabbitMqService _rabbitMqService;

    public InvitationService(
        IInvitationRepository invitationRepository,
        IUserRepository userRepository,
        IEventRepository eventRepository,
        IMapper mapper,
        IRabbitMqService rabbitMqService)
    {
        _invitationRepository = invitationRepository;
        _userRepository = userRepository;
        _eventRepository = eventRepository;
        _mapper = mapper;
        _rabbitMqService = rabbitMqService;
    }

    public async Task<InvitationResponseDto> CreateAsync(CreateInvitationDto dto)
    {
        if (!AllowedRoles.Contains(dto.Role))
            throw new Exception("Role must be one of: Planner, Vendor, ServiceProvider, Attendee, Admin");

        var inviter = await _userRepository.GetByIdAsync(dto.InvitedByUserId);
        if (inviter == null)
            throw new Exception($"Inviting user with ID '{dto.InvitedByUserId}' not found");

        if (dto.EventId.HasValue)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId.Value);
            if (eventEntity == null)
                throw new Exception($"Event with ID '{dto.EventId.Value}' not found");
        }

        var invitation = _mapper.Map<Invitation>(dto);
        invitation.Email = dto.Email.Trim().ToLowerInvariant();
        invitation.Status = "Pending";
        invitation.InvitedAt = DateTime.UtcNow;

        await _invitationRepository.AddAsync(invitation);

        await _rabbitMqService.PublishAsync("UserInvited", new
        {
            invitationId = invitation.InvitationId,
            email = invitation.Email,
            role = invitation.Role,
            eventId = invitation.EventId,
            invitedByUserId = invitation.InvitedByUserId,
            status = invitation.Status,
            invitedAt = invitation.InvitedAt,
            timestamp = DateTime.UtcNow
        });

        return _mapper.Map<InvitationResponseDto>(invitation);
    }

    public async Task<List<InvitationResponseDto>> GetAllAsync()
    {
        var invitations = await _invitationRepository.GetAllAsync();
        return _mapper.Map<List<InvitationResponseDto>>(invitations);
    }

    public async Task<InvitationResponseDto> GetByIdAsync(int id)
    {
        var invitation = await _invitationRepository.GetByIdAsync(id);
        if (invitation == null)
            throw new Exception($"Invitation with ID '{id}' not found");

        return _mapper.Map<InvitationResponseDto>(invitation);
    }
}
