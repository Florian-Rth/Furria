using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class PutEventCancelled : Endpoint<PutEventCancelledRequest>
{
    private readonly EventService _eventService;

    public PutEventCancelled(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/cancelled");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(PutEventCancelledRequest req, CancellationToken ct)
    {
        var result = await _eventService.SetCancelledAsync(req.EventId, req.IsCancelled, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutEventCancelledRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required bool IsCancelled { get; init; }
}

public sealed class PutEventCancelledValidator : Validator<PutEventCancelledRequest>
{
    public PutEventCancelledValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
