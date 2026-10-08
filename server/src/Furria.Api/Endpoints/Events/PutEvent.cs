using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Application.Events;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class PutEvent : Endpoint<PutEventRequest, PutEventResponse>
{
    private readonly EventService _eventService;
    private readonly CalendarService _calendarService;

    public PutEvent(EventService eventService, CalendarService calendarService)
    {
        _eventService = eventService;
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("events/{eventId}");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(PutEventRequest req, CancellationToken ct)
    {
        var result = await _eventService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        var collisions = await _calendarService.FindVenueCollisionsAsync(
            ToCollisionQuery(req, User.PersonId()),
            ct
        );

        await Send.OkAsync(ToResponse(req.EventId, collisions), cancellation: ct);
    }

    private static UpdateEventCommand ToCommand(PutEventRequest req) =>
        new() { EventId = req.EventId, Facts = ToFacts(req) };

    private static EventFactsCommand ToFacts(PutEventRequest req) =>
        new()
        {
            Title = req.Title,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            DoorsOpenAt = req.DoorsOpenAt,
            VenueId = req.VenueId,
            Teaser = req.Teaser,
            Description = req.Description,
            AgeHint = req.AgeHint,
            PriceCents = req.PriceCents,
            PresaleStartsAt = req.PresaleStartsAt,
        };

    private static VenueCollisionQuery ToCollisionQuery(PutEventRequest req, int? viewerPersonId) =>
        new()
        {
            ViewerPersonId = viewerPersonId,
            VenueId = req.VenueId,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            ExcludeCalendarEntryId = req.EventId,
        };

    private static PutEventResponse ToResponse(
        int eventId,
        IReadOnlyList<CalendarEntrySummary> collisions
    ) => new() { EventId = eventId, VenueCollisions = [.. collisions.Select(ToDto)] };

    private static PutEventCollisionDto ToDto(CalendarEntrySummary collision) =>
        new()
        {
            CalendarEntryId = collision.CalendarEntryId,
            Title = collision.Title,
            StartsAt = collision.StartsAt,
            EndsAt = collision.EndsAt,
        };
}

public sealed record PutEventRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required TimeOnly? DoorsOpenAt { get; init; }

    public required int VenueId { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }
}

public sealed class PutEventValidator : Validator<PutEventRequest>
{
    private const string TitleMissingMessage = "Die Veranstaltung braucht einen Titel.";
    private const string TeaserMissingMessage = "Die Veranstaltung braucht einen Anreißer.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string EndsBeforeItStartsMessage =
        "Ein Zeitraum kann nicht vor seinem Beginn enden.";
    private const string DoorsOpenAfterTheStartMessage =
        "Der Einlass liegt vor dem Beginn der Veranstaltung.";
    private const string PresaleAfterTheStartMessage =
        "Der Vorverkauf beginnt vor der Veranstaltung.";
    private const string PriceOutOfRangeMessage = "Dieser Preis ist nicht möglich.";

    public PutEventValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage(TitleMissingMessage)
            .MaximumLength(EventLimits.TitleLength);
        RuleFor(request => request.Teaser)
            .NotEmpty()
            .WithMessage(TeaserMissingMessage)
            .MaximumLength(EventLimits.TeaserLength);
        RuleFor(request => request.Description).MaximumLength(EventLimits.DescriptionLength);
        RuleFor(request => request.AgeHint).MaximumLength(EventLimits.AgeHintLength);
        RuleFor(request => request.VenueId).GreaterThan(0).WithMessage(UnknownVenueMessage);
        RuleFor(request => request.EndsAt)
            .GreaterThan(request => request.StartsAt)
            .When(request => request.EndsAt is not null)
            .WithMessage(EndsBeforeItStartsMessage);
        RuleFor(request => request.DoorsOpenAt)
            .LessThan(request => ClubClock.TimeOf(request.StartsAt))
            .When(request => request.DoorsOpenAt is not null)
            .WithMessage(DoorsOpenAfterTheStartMessage);
        RuleFor(request => request.PresaleStartsAt)
            .LessThan(request => request.StartsAt)
            .When(request => request.PresaleStartsAt is not null)
            .WithMessage(PresaleAfterTheStartMessage);
        RuleFor(request => request.PriceCents)
            .InclusiveBetween(0, EventLimits.MaxPriceCents)
            .When(request => request.PriceCents is not null)
            .WithMessage(PriceOutOfRangeMessage);
    }
}

public sealed record PutEventResponse
{
    public required int EventId { get; init; }

    public required IReadOnlyList<PutEventCollisionDto> VenueCollisions { get; init; }
}

public sealed record PutEventCollisionDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }
}
