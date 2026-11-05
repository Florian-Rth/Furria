using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class PostTablePlan : Endpoint<PostTablePlanRequest>
{
    private readonly TablePlanService _tablePlanService;

    public PostTablePlan(TablePlanService tablePlanService)
    {
        _tablePlanService = tablePlanService;
    }

    public override void Configure()
    {
        Post("events/{eventId}/table-plan");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PostTablePlanRequest req, CancellationToken ct)
    {
        var result = await _tablePlanService.CreateTablePlanAsync(
            new CreateTablePlanCommand
            {
                EventId = req.EventId,
                HallId = req.HallId,
                CopyFromEventId = req.CopyFromEventId,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.StatusCodeAsync(StatusCodes.Status201Created, ct);
    }
}

public sealed record PostTablePlanRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required int? CopyFromEventId { get; init; }
}

public sealed class PostTablePlanValidator : Validator<PostTablePlanRequest>
{
    public PostTablePlanValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.HallId).GreaterThan(0);
        RuleFor(request => request.CopyFromEventId).GreaterThan(0);
    }
}
