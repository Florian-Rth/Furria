using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class GetTablePlans : EndpointWithoutRequest<GetTablePlansResponse>
{
    private readonly TablePlanService _tablePlanService;

    public GetTablePlans(TablePlanService tablePlanService)
    {
        _tablePlanService = tablePlanService;
    }

    public override void Configure()
    {
        Get("table-plans");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var plans = await _tablePlanService.GetTablePlansAsync(ct);

        await Send.OkAsync(
            new GetTablePlansResponse { Plans = [.. plans.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static TablePlanSummaryDto ToDto(TablePlanSummary plan) =>
        new()
        {
            EventId = plan.EventId,
            Title = plan.Title,
            StartsAt = plan.StartsAt,
            HallId = plan.HallId,
            HallName = plan.HallName,
            Tables = plan.Tables,
        };
}

public sealed record GetTablePlansResponse
{
    public required IReadOnlyList<TablePlanSummaryDto> Plans { get; init; }
}

public sealed record TablePlanSummaryDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required int HallId { get; init; }

    public required string HallName { get; init; }

    public required int Tables { get; init; }
}
