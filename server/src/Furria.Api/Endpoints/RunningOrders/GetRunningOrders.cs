using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class GetRunningOrders : EndpointWithoutRequest<GetRunningOrdersResponse>
{
    private readonly RunningOrderService _runningOrderService;

    public GetRunningOrders(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Get("running-orders");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var runningOrders = await _runningOrderService.GetRunningOrdersAsync(ct);

        await Send.OkAsync(
            new GetRunningOrdersResponse { RunningOrders = [.. runningOrders.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static RunningOrderSummaryDto ToDto(RunningOrderSummary summary) =>
        new()
        {
            EventId = summary.EventId,
            Title = summary.Title,
            StartsAt = summary.StartsAt,
            ActIds = summary.ActIds,
        };
}

public sealed record GetRunningOrdersResponse
{
    public required IReadOnlyList<RunningOrderSummaryDto> RunningOrders { get; init; }
}

public sealed record RunningOrderSummaryDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required IReadOnlyList<int> ActIds { get; init; }
}
