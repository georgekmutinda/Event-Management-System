using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;
    private readonly IRabbitMqService _rabbitMqService;
    private readonly AppDbContext _db;

    public PaymentService(
        IPaymentRepository repository,
        IUserRepository userRepository,
        IEventRepository eventRepository,
        IMapper mapper,
        IRabbitMqService rabbitMqService,
        AppDbContext db)
    {
        _repository = repository;
        _userRepository = userRepository;
        _eventRepository = eventRepository;
        _mapper = mapper;
        _rabbitMqService = rabbitMqService;
        _db = db;
    }

    public async Task<PaymentResponseDto> CreateAsync(CreatePaymentDto dto)
    {
        var user = await _userRepository.GetByIdAsync(dto.UserId);
        if (user == null)
        {
            throw new Exception($"User with ID '{dto.UserId}' not found");
        }

        var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
        if (eventEntity == null)
        {
            throw new Exception($"Event with ID '{dto.EventId}' not found");
        }

        if (dto.Amount <= 0)
        {
            throw new Exception("Payment amount must be greater than zero");
        }

        var payment = _mapper.Map<Payment>(dto);
        payment.PaymentStatus = string.IsNullOrWhiteSpace(dto.PaymentStatus) ? "Completed" : dto.PaymentStatus.Trim();
        payment.PaymentDate = DateTime.UtcNow;

        await _repository.AddAsync(payment);
        await EnsureRegistrationStatusAsync(dto.EventId, dto.UserId, payment.PaymentStatus);

        await _rabbitMqService.PublishAsync("PaymentCreated", new
        {
            paymentId = payment.PaymentId,
            userId = payment.UserId,
            eventId = payment.EventId,
            amount = payment.Amount,
            paymentStatus = payment.PaymentStatus,
            paymentDate = payment.PaymentDate,
            timestamp = DateTime.UtcNow
        });

        return _mapper.Map<PaymentResponseDto>(payment);
    }

    public async Task<List<PaymentResponseDto>> GetAllAsync()
    {
        var payments = await _repository.GetAllAsync();
        return _mapper.Map<List<PaymentResponseDto>>(payments);
    }

    public async Task<PaymentResponseDto> GetByIdAsync(int id)
    {
        var payment = await _repository.GetByIdAsync(id);
        if (payment == null)
        {
            throw new Exception($"Payment with ID '{id}' not found");
        }

        return _mapper.Map<PaymentResponseDto>(payment);
    }

    public async Task<PaymentCodeRedemptionResponseDto> RedeemCodeAsync(string code, int userId, int? eventId)
    {
        var paymentCode = await _db.PaymentCodes
            .Include(item => item.Event)
            .FirstOrDefaultAsync(item => item.Code == code)
            ?? throw new InvalidOperationException("Payment code was not found.");

        if (paymentCode.IsRedeemed)
        {
            throw new InvalidOperationException("Payment code has already been redeemed.");
        }

        var resolvedEventId = paymentCode.EventId ?? eventId;
        if (!resolvedEventId.HasValue || resolvedEventId <= 0)
        {
            throw new InvalidOperationException("This payment code is not linked to an event.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("The signed-in user could not be found.");
        }

        var eventEntity = await _eventRepository.GetByIdAsync(resolvedEventId.Value);
        if (eventEntity == null)
        {
            throw new InvalidOperationException("The event for this payment code could not be found.");
        }

        var payment = new Payment
        {
            UserId = userId,
            EventId = resolvedEventId.Value,
            Amount = paymentCode.Amount,
            PaymentStatus = "Completed",
            PaymentDate = DateTime.UtcNow
        };

        await _repository.AddAsync(payment);
        await EnsureRegistrationStatusAsync(resolvedEventId.Value, userId, "Completed");

        paymentCode.IsRedeemed = true;
        paymentCode.RedeemedAt = DateTime.UtcNow;
        paymentCode.PaymentId = payment.PaymentId;
        paymentCode.EventId = resolvedEventId.Value;

        await _db.SaveChangesAsync();

        return new PaymentCodeRedemptionResponseDto
        {
            PaymentId = payment.PaymentId,
            Code = paymentCode.Code,
            EventName = paymentCode.EventName ?? eventEntity.Title,
            Amount = $"KES {payment.Amount:N2}",
            Reference = $"PAY-{payment.PaymentId:D5}",
            Status = "Redeemed",
            RedeemedAt = paymentCode.RedeemedAt ?? DateTime.UtcNow
        };
    }

    private async Task EnsureRegistrationStatusAsync(int eventId, int userId, string paymentStatus)
    {
        var registration = await _db.EventRegistration
            .FirstOrDefaultAsync(item => item.EventId == eventId && item.AttendeeId == userId);

        if (registration == null)
        {
            registration = new EventRegistration
            {
                EventId = eventId,
                AttendeeId = userId,
                TicketType = "Standard",
                PaymentStatus = paymentStatus,
                RegisteredAt = DateTime.UtcNow
            };

            _db.EventRegistration.Add(registration);
        }
        else
        {
            registration.PaymentStatus = paymentStatus;
        }

        await _db.SaveChangesAsync();
    }
}
