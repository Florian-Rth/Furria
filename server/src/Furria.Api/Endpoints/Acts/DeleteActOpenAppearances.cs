using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActOpenAppearances : Endpoint<DeleteActOpenAppearancesRequest>
{
    private readonly RunningOrderService _runningOrderService;

    public DeleteActOpenAppearances(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/open-appearances");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(
        DeleteActOpenAppearancesRequest req,
        CancellationToken ct
    )
    {
        var result = await _runningOrderService.WithdrawFromOpenEveningsAsync(req.ActId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteActOpenAppearancesRequest
{
    [RouteParam]
    public required int ActId { get; init; }
}

public sealed class DeleteActOpenAppearancesValidator : Validator<DeleteActOpenAppearancesRequest>
{
    public DeleteActOpenAppearancesValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
    }
}
