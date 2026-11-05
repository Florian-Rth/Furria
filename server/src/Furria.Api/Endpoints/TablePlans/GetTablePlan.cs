using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Halls;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class GetTablePlan : Endpoint<GetTablePlanRequest, GetTablePlanResponse>
{
    private readonly TablePlanService _tablePlanService;

    public GetTablePlan(TablePlanService tablePlanService)
    {
        _tablePlanService = tablePlanService;
    }

    public override void Configure()
    {
        Get("events/{eventId}/table-plan");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(GetTablePlanRequest req, CancellationToken ct)
    {
        var plan = await _tablePlanService.GetTablePlanAsync(req.EventId, ct);
        if (plan is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(plan), cancellation: ct);
    }

    private static GetTablePlanResponse ToResponse(TablePlanDetails plan) =>
        new()
        {
            EventId = plan.EventId,
            HallId = plan.HallId,
            Document = TablePlanDocumentDto.Of(plan.Document),
            Version = plan.Version,
            Hall = new TablePlanHallDto
            {
                HallId = plan.Hall.HallId,
                VenueId = plan.Hall.VenueId,
                VenueName = plan.Hall.VenueName,
                Name = plan.Hall.Name,
                Document = HallDocumentDto.Of(plan.Hall.Document),
                Version = plan.Hall.Version,
            },
        };
}

public sealed record GetTablePlanRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class GetTablePlanValidator : Validator<GetTablePlanRequest>
{
    public GetTablePlanValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}

public sealed record GetTablePlanResponse
{
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required TablePlanDocumentDto Document { get; init; }

    public required int Version { get; init; }

    public required TablePlanHallDto Hall { get; init; }
}

public sealed record TablePlanHallDto
{
    public required int HallId { get; init; }

    public required int VenueId { get; init; }

    public required string VenueName { get; init; }

    public required string Name { get; init; }

    public required HallDocumentDto Document { get; init; }

    public required int Version { get; init; }
}
