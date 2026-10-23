using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class PutRunningOrderConfirmation
    : Endpoint<PutRunningOrderConfirmationRequest, PutRunningOrderConfirmationResponse>
{
    private readonly RunningOrderService _runningOrderService;

    public PutRunningOrderConfirmation(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/running-order/confirmation");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(
        PutRunningOrderConfirmationRequest req,
        CancellationToken ct
    )
    {
        var result = await _runningOrderService.ConfirmAsync(req.EventId, req.Confirmed, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static PutRunningOrderConfirmationResponse ToResponse(RunningOrderDetails details) =>
        new()
        {
            EventId = details.EventId,
            Version = details.Version,
            ConfirmedAt = details.ConfirmedAt,
            ChangedSinceConfirmed = details.ChangedSinceConfirmed,
            Lines = [.. details.Lines.Select(RunningOrderLineDto.From)],
            Rules = [.. details.Rules.Select(RunningOrderRuleDto.From)],
            ActWishes = [.. details.ActWishes.Select(RunningOrderActWishDto.From)],
            Findings = [.. details.Findings.Select(RunningOrderFindingDto.From)],
        };
}

public sealed record PutRunningOrderConfirmationRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required bool Confirmed { get; init; }
}

public sealed class PutRunningOrderConfirmationValidator
    : Validator<PutRunningOrderConfirmationRequest>
{
    public PutRunningOrderConfirmationValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}

public sealed record PutRunningOrderConfirmationResponse
{
    public required int EventId { get; init; }

    public required int Version { get; init; }

    public required DateTimeOffset? ConfirmedAt { get; init; }

    public required bool ChangedSinceConfirmed { get; init; }

    public required IReadOnlyList<RunningOrderLineDto> Lines { get; init; }

    public required IReadOnlyList<RunningOrderRuleDto> Rules { get; init; }

    public required IReadOnlyList<RunningOrderActWishDto> ActWishes { get; init; }

    public required IReadOnlyList<RunningOrderFindingDto> Findings { get; init; }
}
