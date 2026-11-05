using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Core.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class PutTablePlan : Endpoint<PutTablePlanRequest, PutTablePlanResponse>
{
    private readonly TablePlanService _tablePlanService;

    public PutTablePlan(TablePlanService tablePlanService)
    {
        _tablePlanService = tablePlanService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/table-plan");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PutTablePlanRequest req, CancellationToken ct)
    {
        var result = await _tablePlanService.SaveTablePlanAsync(
            new SaveTablePlanCommand
            {
                EventId = req.EventId,
                HallId = req.HallId,
                Document = req.Document.ToDocument(),
                Version = req.Version,
                Count = new TablePlanCount(req.Tables, req.Chairs),
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PutTablePlanResponse { Version = result.Value }, cancellation: ct);
    }
}

public sealed record PutTablePlanRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required TablePlanDocumentDto Document { get; init; }

    public required int Version { get; init; }

    public required int Tables { get; init; }

    public required int Chairs { get; init; }
}

public sealed class PutTablePlanValidator : Validator<PutTablePlanRequest>
{
    public PutTablePlanValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.HallId).GreaterThan(0);
        RuleFor(request => request.Document)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .SetValidator(new TablePlanDocumentValidator());
        RuleFor(request => request.Version).GreaterThan(0);
        RuleFor(request => request.Chairs).InclusiveBetween(0, HallLimits.MostChairs);
        RuleFor(request => request)
            .Must(CountAllTables)
            .When(request => request.Document is { Rows: not null })
            .WithMessage("Die Zahl der Tische passt nicht zum Tischplan.");
    }

    [Pure]
    private static bool CountAllTables(PutTablePlanRequest request) =>
        request.Tables == request.Document.Rows.Sum(row => row.Count);
}

public sealed record PutTablePlanResponse
{
    public required int Version { get; init; }
}
