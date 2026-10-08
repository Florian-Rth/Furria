using FastEndpoints;
using FluentValidation;
using Furria.Api.Altcha;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.Events;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.TicketRequests;

public sealed class PostTicketRequest
    : Endpoint<PostTicketRequestRequest, PostTicketRequestResponse>
{
    private const string AltchaRefusedMessage =
        "Die Sicherheitsprüfung ist abgelaufen oder ungültig. Bitte versuch es noch einmal.";

    private readonly TicketRequestService _ticketRequestService;
    private readonly AltchaChallenges _altchaChallenges;
    private readonly AddressRateLimiter _addressRateLimiter;

    public PostTicketRequest(
        TicketRequestService ticketRequestService,
        AltchaChallenges altchaChallenges,
        AddressRateLimiter addressRateLimiter
    )
    {
        _ticketRequestService = ticketRequestService;
        _altchaChallenges = altchaChallenges;
        _addressRateLimiter = addressRateLimiter;
    }

    public override void Configure()
    {
        Post("ticket-requests");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(PostTicketRequestRequest req, CancellationToken ct)
    {
        if (_altchaChallenges.Redeem(req.Altcha) is not null)
        {
            AddError(request => request.Altcha, AltchaRefusedMessage);
            await Send.ErrorsAsync(cancellation: ct);
            return;
        }

        if (!_addressRateLimiter.TryAcquire(AddressRateLimitScope.TicketRequest, req.Email))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var result = await _ticketRequestService.SubmitAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostTicketRequestResponse(), cancellation: ct);
    }

    private static SubmitTicketRequestCommand ToCommand(PostTicketRequestRequest req) =>
        new()
        {
            EventId = req.EventId,
            TicketCount = req.TicketCount,
            Name = req.Name,
            Phone = req.Phone,
            Email = req.Email,
            Message = req.Message,
        };
}

public sealed record PostTicketRequestRequest
{
    public required int EventId { get; init; }

    public required int TicketCount { get; init; }

    public required string Name { get; init; }

    public required string Phone { get; init; }

    public required string Email { get; init; }

    public required string? Message { get; init; }

    public required bool ConsentAccepted { get; init; }

    public required string Altcha { get; init; }
}

public sealed class PostTicketRequestValidator : Validator<PostTicketRequestRequest>
{
    private const int AltchaLength = 4_096;
    private const string PhonePattern = @"^[+0][\d\s()/.-]{5,30}$";

    public PostTicketRequestValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.TicketCount)
            .InclusiveBetween(TicketRequest.FewestTickets, TicketRequest.MostTickets);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(TicketRequest.NameLength);
        RuleFor(request => request.Phone).NotEmpty().Matches(PhonePattern);
        RuleFor(request => request.Email)
            .NotEmpty()
            .MaximumLength(TicketRequest.EmailLength)
            .EmailAddress();
        RuleFor(request => request.Message).MaximumLength(TicketRequest.MessageLength);
        RuleFor(request => request.ConsentAccepted).Equal(true);
        RuleFor(request => request.Altcha).NotEmpty().MaximumLength(AltchaLength);
    }
}

public sealed record PostTicketRequestResponse;
