using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Events;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class GetEventById : Endpoint<GetEventByIdRequest, GetEventByIdResponse>
{
    private readonly EventService _eventService;

    public GetEventById(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Get("events/{eventId}");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(GetEventByIdRequest req, CancellationToken ct)
    {
        var details = await _eventService.GetEventAsync(req.EventId, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetEventByIdResponse ToResponse(EventDetails details) =>
        new()
        {
            EventId = details.EventId,
            Title = details.Title,
            StartsAt = details.StartsAt,
            EndsAt = details.EndsAt,
            DoorsOpenAt = details.DoorsOpenAt,
            VenueId = details.VenueId,
            VenueName = details.VenueName,
            Teaser = details.Teaser,
            Description = details.Description,
            AgeHint = details.AgeHint,
            PriceCents = details.PriceCents,
            PresaleStartsAt = details.PresaleStartsAt,
            TicketAvailability = details.TicketAvailability,
            CancelledAt = details.CancelledAt,
            Status = details.Status,
            IsOver = details.IsOver,
        };
}

public sealed record GetEventByIdRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class GetEventByIdValidator : Validator<GetEventByIdRequest>
{
    public GetEventByIdValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}

public sealed record GetEventByIdResponse
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required TimeOnly? DoorsOpenAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required TicketAvailability TicketAvailability { get; init; }

    public required DateTimeOffset? CancelledAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required bool IsOver { get; init; }
}
