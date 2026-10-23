using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class GetRunningOrder : Endpoint<GetRunningOrderRequest, GetRunningOrderResponse>
{
    private readonly RunningOrderService _runningOrderService;

    public GetRunningOrder(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Get("events/{eventId}/running-order");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(GetRunningOrderRequest req, CancellationToken ct)
    {
        var details = await _runningOrderService.GetRunningOrderAsync(req.EventId, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetRunningOrderResponse ToResponse(RunningOrderDetails details) =>
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

public sealed record GetRunningOrderRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class GetRunningOrderValidator : Validator<GetRunningOrderRequest>
{
    public GetRunningOrderValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}

public sealed record GetRunningOrderResponse
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
