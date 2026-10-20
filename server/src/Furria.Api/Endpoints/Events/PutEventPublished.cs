using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class PutEventPublished : Endpoint<PutEventPublishedRequest>
{
    private readonly EventService _eventService;

    public PutEventPublished(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/published");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(PutEventPublishedRequest req, CancellationToken ct)
    {
        var result = await _eventService.PublishAsync(req.EventId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutEventPublishedRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class PutEventPublishedValidator : Validator<PutEventPublishedRequest>
{
    public PutEventPublishedValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
