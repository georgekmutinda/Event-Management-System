using AutoMapper;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;

namespace Application.Services;

/// <summary>
/// Service for managing payment operations.
/// Implements IPaymentService with business logic for payment CRUD operations.
/// Uses repository pattern and AutoMapper for clean separation of concerns.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;
    private readonly IRabbitMqService _rabbitMqService;

    public PaymentService(
        IPaymentRepository repository,
        IUserRepository userRepository,
        IEventRepository eventRepository,
        IMapper mapper,
        IRabbitMqService rabbitMqService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _eventRepository = eventRepository;
        _mapper = mapper;
        _rabbitMqService = rabbitMqService;
    }

    /// <summary>
    /// Creates a new payment record.
    /// Validates that both user and event exist before creating.
    /// Sets default payment status to "Pending" and payment date to UTC now.
    /// </summary>
    public async Task<PaymentResponseDto> CreateAsync(CreatePaymentDto dto)
    {
        // Validate that user exists
        var user = await _userRepository.GetByIdAsync(dto.UserId);
        if (user == null)
            throw new Exception($"User with ID '{dto.UserId}' not found");

        // Validate that event exists
        var eventEntity = await _eventRepository.GetByIdAsync(dto.EventId);
        if (eventEntity == null)
            throw new Exception($"Event with ID '{dto.EventId}' not found");

        // Validate amount
        if (dto.Amount <= 0)
            throw new Exception("Payment amount must be greater than zero");

        // Map DTO to entity
        var payment = _mapper.Map<Payment>(dto);
        payment.PaymentStatus = "Pending"; // Default status
        payment.PaymentDate = DateTime.UtcNow; // Set current UTC time

        // Add to repository
        await _repository.AddAsync(payment);

        // Publish PaymentCreated event to RabbitMQ
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

        // Return mapped response
        return _mapper.Map<PaymentResponseDto>(payment);
    }

    /// <summary>
    /// Retrieves all payments from the system.
    /// </summary>
    public async Task<List<PaymentResponseDto>> GetAllAsync()
    {
        var payments = await _repository.GetAllAsync();
        return _mapper.Map<List<PaymentResponseDto>>(payments);
    }

    /// <summary>
    /// Retrieves a single payment by ID.
    /// Throws exception if payment not found.
    /// </summary>
    public async Task<PaymentResponseDto> GetByIdAsync(int id)
    {
        var payment = await _repository.GetByIdAsync(id);

        if (payment == null)
            throw new Exception($"Payment with ID '{id}' not found");

        return _mapper.Map<PaymentResponseDto>(payment);
    }
}
