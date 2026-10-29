using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class PutRunningOrder : Endpoint<PutRunningOrderRequest, PutRunningOrderResponse>
{
    private readonly RunningOrderService _runningOrderService;

    public PutRunningOrder(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/running-order");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(PutRunningOrderRequest req, CancellationToken ct)
    {
        var result = await _runningOrderService.SaveAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static SaveRunningOrderCommand ToCommand(PutRunningOrderRequest req) =>
        new()
        {
            EventId = req.EventId,
            Version = req.Version,
            State = new RunningOrderStateCommand
            {
                Lines = [.. req.Lines.Select(line => line.ToDraft())],
                Rules = [.. req.Rules.Select(rule => rule.ToDraft())],
                SuspendedActWishIds = req.SuspendedActWishIds,
            },
        };

    private static PutRunningOrderResponse ToResponse(RunningOrderDetails details) =>
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

public sealed record PutRunningOrderRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required int? Version { get; init; }

    public required IReadOnlyList<RunningOrderLineDataDto> Lines { get; init; }

    public required IReadOnlyList<RunningOrderRuleDataDto> Rules { get; init; }

    public required IReadOnlyList<int> SuspendedActWishIds { get; init; }
}

public sealed class PutRunningOrderValidator : Validator<PutRunningOrderRequest>
{
    private const int MostLines = 200;
    private const int MostRules = 200;

    public PutRunningOrderValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.Lines)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(lines => lines.Count <= MostLines);
        RuleFor(request => request.Rules)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(rules => rules.Count <= MostRules);
        RuleFor(request => request.SuspendedActWishIds).NotNull();
    }
}

public sealed record PutRunningOrderResponse
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
