using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Events;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Events;

public sealed class EventService
{
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage =
        "Ein archivierter Ort kann nicht mehr gewählt werden.";
    private const string PresaleNotBegunMessage =
        "Die Kartenlage lässt sich erst setzen, wenn der Vorverkauf begonnen hat.";
    private const string AlreadyCancelledMessage = "Diese Veranstaltung ist bereits abgesagt.";
    private const string NotCancelledMessage = "Diese Veranstaltung ist nicht abgesagt.";

    private static readonly Expression<Func<Event, PublicRow>> PublicRowOf = row => new PublicRow(
        row.CalendarEntryId,
        row.CalendarEntry!.Title,
        row.CalendarEntry.StartsAt,
        row.CalendarEntry.EndsAt,
        row.DoorsOpenAt,
        new PublicEventVenue
        {
            Name = row.CalendarEntry.Venue!.Name,
            Street = row.CalendarEntry.Venue.Street,
            Zip = row.CalendarEntry.Venue.Zip,
            City = row.CalendarEntry.Venue.City,
            Hint = row.CalendarEntry.Venue.Hint,
        },
        row.Teaser,
        row.CalendarEntry.Description,
        row.AgeHint,
        row.PriceCents,
        row.PresaleStartsAt,
        row.TicketAvailability,
        row.CancelledAt
    );

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public EventService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<EventSummary>> GetRelevantEventsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var relevantSessionOpens = ClubClock.StartOfDay(
            ClubSession.OpeningOf(ClubSession.RelevantYearOf(ClubClock.Today(_timeProvider)))
        );
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        var rows = await _dbContext
            .Events.AsNoTracking()
            .Where(row =>
                row.CalendarEntry!.StartsAt >= relevantSessionOpens
                || (
                    row.CalendarEntry.EndsAt == null
                        ? row.CalendarEntry.StartsAt > openEndedCutoff
                        : row.CalendarEntry.EndsAt > now
                )
            )
            .OrderBy(row =>
                row.CalendarEntry!.EndsAt == null
                    ? row.CalendarEntry.StartsAt <= openEndedCutoff
                    : row.CalendarEntry.EndsAt <= now
            )
            .ThenBy(row => row.CalendarEntry!.StartsAt)
            .ThenBy(row => row.CalendarEntryId)
            .Select(row => new SummaryRow(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.CalendarEntry.EndsAt,
                row.CalendarEntry.Venue!.Name,
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt,
                row.CalendarEntry.EndsAt == null
                    ? row.CalendarEntry.StartsAt <= openEndedCutoff
                    : row.CalendarEntry.EndsAt <= now
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, now))];
    }

    public async Task<EventDetails?> GetEventAsync(int eventId, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        var row = await _dbContext
            .Events.AsNoTracking()
            .Where(row => row.CalendarEntryId == eventId)
            .Select(row => new DetailsRow(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.CalendarEntry.EndsAt,
                row.DoorsOpenAt,
                row.CalendarEntry.VenueId,
                row.CalendarEntry.Venue!.Name,
                row.Teaser,
                row.CalendarEntry.Description,
                row.AgeHint,
                row.PriceCents,
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt,
                row.CalendarEntry.EndsAt == null
                    ? row.CalendarEntry.StartsAt <= openEndedCutoff
                    : row.CalendarEntry.EndsAt <= now
            ))
            .SingleOrDefaultAsync(ct);

        return row is null ? null : ToDetails(row, now);
    }

    public async Task<IReadOnlyList<PublicEventSummary>> GetPublicEventsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();

        var rows = await PublicEvents(now)
            .OrderBy(row => row.CalendarEntry!.StartsAt)
            .ThenBy(row => row.CalendarEntryId)
            .Select(PublicRowOf)
            .ToListAsync(ct);

        return [.. rows.Select(row => ToPublicSummary(row, now))];
    }

    public async Task<PublicEventDetails?> GetPublicEventAsync(int eventId, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();

        var row = await PublicEvents(now)
            .Where(row => row.CalendarEntryId == eventId)
            .Select(PublicRowOf)
            .SingleOrDefaultAsync(ct);

        return row is null ? null : ToPublicDetails(row, now);
    }

    public async Task<Result<int>> CreateAsync(EventFactsCommand facts, CancellationToken ct)
    {
        if (await VenueRefusalAsync(facts.VenueId, ct) is { } refusal)
            return Result<int>.Validation(refusal);

        var entry = new CalendarEntry
        {
            Kind = CalendarEntryKind.Event,
            Visibility = CalendarEntryVisibility.Public,
            AsksForResponse = false,
            Event = new Event(),
        };
        Apply(entry, facts, _timeProvider.GetUtcNow());

        _dbContext.CalendarEntries.Add(entry);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(entry.Id);
    }

    public async Task<Result> UpdateAsync(UpdateEventCommand command, CancellationToken ct)
    {
        var entry = await TrackedEventEntryAsync(command.EventId, ct);

        if (entry is null)
            return Result.NotFound(UnknownEventMessage);

        if (await VenueRefusalAsync(command.Facts.VenueId, ct) is { } refusal)
            return Result.Validation(refusal);

        Apply(entry, command.Facts, _timeProvider.GetUtcNow());
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> SetTicketAvailabilityAsync(
        int eventId,
        TicketAvailability availability,
        CancellationToken ct
    )
    {
        var held = await TrackedEventAsync(eventId, ct);

        if (held is null)
            return Result.NotFound(UnknownEventMessage);

        if (!EventSales.HasPresaleBegun(held.PresaleStartsAt, _timeProvider.GetUtcNow()))
            return Result.Conflict(PresaleNotBegunMessage);

        held.TicketAvailability = availability;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> SetCancelledAsync(int eventId, bool isCancelled, CancellationToken ct)
    {
        var held = await TrackedEventAsync(eventId, ct);

        if (held is null)
            return Result.NotFound(UnknownEventMessage);

        if (isCancelled == held.CancelledAt is not null)
            return Result.Conflict(isCancelled ? AlreadyCancelledMessage : NotCancelledMessage);

        held.CancelledAt = isCancelled ? _timeProvider.GetUtcNow() : null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int eventId, CancellationToken ct)
    {
        var entry = await TrackedEventEntryAsync(eventId, ct);

        if (entry is null)
            return Result.NotFound(UnknownEventMessage);

        var openRequests = await _dbContext.TicketRequests.CountAsync(
            request => request.EventId == eventId,
            ct
        );
        if (openRequests > 0)
            return Result.Conflict(OpenRequestsMessage(openRequests));

        _dbContext.CalendarEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private static void Apply(CalendarEntry entry, EventFactsCommand facts, DateTimeOffset now)
    {
        var held = entry.Event!;

        entry.Title = facts.Title;
        entry.StartsAt = facts.StartsAt;
        entry.EndsAt = facts.EndsAt;
        entry.VenueId = facts.VenueId;
        entry.Description = facts.Description;
        held.DoorsOpenAt = facts.DoorsOpenAt;
        held.Teaser = facts.Teaser;
        held.AgeHint = facts.AgeHint;
        held.PriceCents = facts.PriceCents;
        held.PresaleStartsAt = facts.PresaleStartsAt;

        if (!EventSales.HasPresaleBegun(facts.PresaleStartsAt, now))
            held.TicketAvailability = TicketAvailability.Available;
    }

    [Pure]
    private static string OpenRequestsMessage(int openRequests) =>
        openRequests == 1
            ? "Zu dieser Veranstaltung ist noch 1 Kartenanfrage offen. Erledige sie, bevor du die Veranstaltung löschst."
            : $"Zu dieser Veranstaltung sind noch {openRequests} Kartenanfragen offen. Erledige sie, bevor du die Veranstaltung löschst.";

    [Pure]
    private static EventSummary ToSummary(SummaryRow row, DateTimeOffset now) =>
        new()
        {
            EventId = row.EventId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            VenueName = row.VenueName,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = EventSales.StatusOf(
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt is not null,
                now
            ),
            IsOver = row.IsOver,
        };

    [Pure]
    private static EventDetails ToDetails(DetailsRow row, DateTimeOffset now) =>
        new()
        {
            EventId = row.EventId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            DoorsOpenAt = row.DoorsOpenAt,
            VenueId = row.VenueId,
            VenueName = row.VenueName,
            Teaser = row.Teaser,
            Description = row.Description,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            TicketAvailability = row.TicketAvailability,
            CancelledAt = row.CancelledAt,
            Status = EventSales.StatusOf(
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt is not null,
                now
            ),
            IsOver = row.IsOver,
        };

    [Pure]
    private static PublicEventSummary ToPublicSummary(PublicRow row, DateTimeOffset now) =>
        new()
        {
            EventId = row.EventId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            DoorsOpenAt = DoorsOpenInstantOf(row),
            Venue = row.Venue,
            Teaser = row.Teaser,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = PublicStatusOf(row, now),
        };

    [Pure]
    private static PublicEventDetails ToPublicDetails(PublicRow row, DateTimeOffset now) =>
        new()
        {
            EventId = row.EventId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            DoorsOpenAt = DoorsOpenInstantOf(row),
            Venue = row.Venue,
            Teaser = row.Teaser,
            Description = row.Description,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = PublicStatusOf(row, now),
        };

    [Pure]
    private static DateTimeOffset? DoorsOpenInstantOf(PublicRow row) =>
        row.DoorsOpenAt is { } doorsOpenAt
            ? ClubClock.At(ClubClock.DayOf(row.StartsAt), doorsOpenAt)
            : null;

    [Pure]
    private static EventSalesStatus PublicStatusOf(PublicRow row, DateTimeOffset now) =>
        EventSales.StatusOf(
            row.PresaleStartsAt,
            row.TicketAvailability,
            row.CancelledAt is not null,
            now
        );

    [Pure]
    private static Expression<Func<Event, bool>> IsNotOverAt(DateTimeOffset now)
    {
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        return row =>
            row.CalendarEntry!.EndsAt == null
                ? row.CalendarEntry.StartsAt > openEndedCutoff
                : row.CalendarEntry.EndsAt > now;
    }

    private IQueryable<Event> PublicEvents(DateTimeOffset now) =>
        _dbContext
            .Events.AsNoTracking()
            .Where(row => row.CalendarEntry!.Venue != null)
            .Where(IsNotOverAt(now));

    private Task<CalendarEntry?> TrackedEventEntryAsync(int eventId, CancellationToken ct) =>
        _dbContext
            .CalendarEntries.Include(entry => entry.Event)
            .Where(entry => entry.Kind == CalendarEntryKind.Event && entry.Event != null)
            .SingleOrDefaultAsync(entry => entry.Id == eventId, ct);

    private Task<Event?> TrackedEventAsync(int eventId, CancellationToken ct) =>
        _dbContext.Events.SingleOrDefaultAsync(row => row.CalendarEntryId == eventId, ct);

    private async Task<string?> VenueRefusalAsync(int venueId, CancellationToken ct)
    {
        var archivedOn = await _dbContext
            .Venues.AsNoTracking()
            .Where(venue => venue.Id == venueId)
            .Select(venue => new VenueStateRow(venue.ArchivedOn))
            .SingleOrDefaultAsync(ct);

        if (archivedOn is null)
            return UnknownVenueMessage;

        return archivedOn.ArchivedOn is null ? null : ArchivedVenueMessage;
    }

    private sealed record SummaryRow(
        int EventId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        string? VenueName,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt,
        bool IsOver
    );

    private sealed record DetailsRow(
        int EventId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        TimeOnly? DoorsOpenAt,
        int? VenueId,
        string? VenueName,
        string Teaser,
        string? Description,
        string? AgeHint,
        int? PriceCents,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt,
        bool IsOver
    );

    private sealed record PublicRow(
        int EventId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        TimeOnly? DoorsOpenAt,
        PublicEventVenue Venue,
        string Teaser,
        string? Description,
        string? AgeHint,
        int? PriceCents,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt
    );

    private sealed record VenueStateRow(DateOnly? ArchivedOn);
}
