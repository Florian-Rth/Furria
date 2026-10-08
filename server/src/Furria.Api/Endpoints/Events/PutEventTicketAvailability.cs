using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class PutEventTicketAvailability : Endpoint<PutEventTicketAvailabilityRequest>
{
    private readonly EventService _eventService;

    public PutEventTicketAvailability(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/ticket-availability");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(
        PutEventTicketAvailabilityRequest req,
        CancellationToken ct
    )
    {
        var result = await _eventService.SetTicketAvailabilityAsync(
            req.EventId,
            req.TicketAvailability,
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutEventTicketAvailabilityRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required TicketAvailability TicketAvailability { get; init; }
}

public sealed class PutEventTicketAvailabilityValidator
    : Validator<PutEventTicketAvailabilityRequest>
{
    private const string UnknownAvailabilityMessage = "Diese Kartenlage gibt es nicht.";

    public PutEventTicketAvailabilityValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.TicketAvailability)
            .IsInEnum()
            .WithMessage(UnknownAvailabilityMessage);
    }
}
