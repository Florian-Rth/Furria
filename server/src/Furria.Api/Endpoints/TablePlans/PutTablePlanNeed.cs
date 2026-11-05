using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class PutTablePlanNeed : Endpoint<PutTablePlanNeedRequest>
{
    private readonly TablePlanService _tablePlanService;

    public PutTablePlanNeed(TablePlanService tablePlanService)
    {
        _tablePlanService = tablePlanService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/table-plan-need");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PutTablePlanNeedRequest req, CancellationToken ct)
    {
        var result = await _tablePlanService.SetNeededAsync(req.EventId, req.Needed, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutTablePlanNeedRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required bool Needed { get; init; }
}

public sealed class PutTablePlanNeedValidator : Validator<PutTablePlanNeedRequest>
{
    public PutTablePlanNeedValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
