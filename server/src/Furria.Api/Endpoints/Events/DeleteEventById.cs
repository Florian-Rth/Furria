using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class DeleteEventById : Endpoint<DeleteEventByIdRequest>
{
    private readonly EventService _eventService;

    public DeleteEventById(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Delete("events/{eventId}");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(DeleteEventByIdRequest req, CancellationToken ct)
    {
        var result = await _eventService.DeleteAsync(req.EventId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteEventByIdRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class DeleteEventByIdValidator : Validator<DeleteEventByIdRequest>
{
    public DeleteEventByIdValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
