using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class DeleteRunningOrder : Endpoint<DeleteRunningOrderRequest>
{
    private readonly RunningOrderService _runningOrderService;

    public DeleteRunningOrder(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Delete("events/{eventId}/running-order");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(DeleteRunningOrderRequest req, CancellationToken ct)
    {
        var result = await _runningOrderService.DeleteAsync(req.EventId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteRunningOrderRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class DeleteRunningOrderValidator : Validator<DeleteRunningOrderRequest>
{
    public DeleteRunningOrderValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
