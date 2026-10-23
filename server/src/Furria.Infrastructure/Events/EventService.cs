using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Events;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Public;
using Furria.Infrastructure.RunningOrders;
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
    private const string AlreadyPublishedMessage =
        "Diese Veranstaltung ist bereits veröffentlicht.";
    private const string CancelledUnpublishableMessage =
        "Eine abgesagte Veranstaltung wird nicht veröffentlicht.";
    private const string OverMessage = "Diese Veranstaltung ist schon vorbei.";
    private const string MissingDetailsLead = "Für die Veröffentlichung fehlen noch: ";

    private static readonly IReadOnlyDictionary<MissingEventDetail, string> DetailLabels =
        new Dictionary<MissingEventDetail, string>
        {
            [MissingEventDetail.Venue] = "Ort",
            [MissingEventDetail.DoorsOpenAt] = "Einlass",
            [MissingEventDetail.Description] = "Beschreibung",
            [MissingEventDetail.Picture] = "Bild",
        };

    private readonly AppDbContext _dbContext;
    private readonly PublicFace _publicFace;
    private readonly MediaPictures _pictures;
    private readonly RunningOrderService _runningOrders;
    private readonly TimeProvider _timeProvider;

    public EventService(
        AppDbContext dbContext,
        PublicFace publicFace,
        MediaPictures pictures,
        RunningOrderService runningOrders,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _publicFace = publicFace;
        _pictures = pictures;
        _runningOrders = runningOrders;
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
                    : row.CalendarEntry.EndsAt <= now,
                row.PictureId,
                row.Picture == null ? null : row.Picture.RenderedAt,
                row.DoorsOpenAt,
                row.PriceCents,
                row.CalendarEntry.VenueId != null,
                row.CalendarEntry.Description != null && row.CalendarEntry.Description.Trim() != "",
                row.CreatedAt,
                row.PublishedAt
            ))
            .ToListAsync(ct);
        var eventIds = rows.Select(row => row.EventId).ToList();
        var tallies = await TalliesOfAsync(eventIds, ct);
        var settled = await _runningOrders.SettledEventIdsAsync(eventIds, ct);

        return
        [
            .. rows.Select(row =>
                ToSummary(
                    row,
                    now,
                    _pictures.Of(
                        MediaOwner.Event(row.EventId),
                        row.PictureId,
                        row.PictureRenderedAt
                    ),
                    PlanningOf(
                        PlanningInputsOf(row),
                        tallies.GetValueOrDefault(row.EventId),
                        settled.Contains(row.EventId),
                        now
                    )
                )
            ),
        ];
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
                    : row.CalendarEntry.EndsAt <= now,
                row.Picture == null
                    ? null
                    : new MediaPictureRow(
                        row.Picture.Id,
                        row.Picture.State,
                        row.Picture.RenderedAt,
                        row.Picture.Crop
                    ),
                row.CreatedAt,
                row.PublishedAt
            ))
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return null;

        var stalledIds = await _dbContext.StalledAmongAsync([row.Picture], now, ct);
        var tallies = await TalliesOfAsync([row.EventId], ct);
        var settled = await _runningOrders.SettledEventIdsAsync([row.EventId], ct);
        var planning = PlanningOf(
            PlanningInputsOf(row),
            tallies.GetValueOrDefault(row.EventId),
            settled.Contains(row.EventId),
            now
        );
        return ToDetails(row, now, EditingOf(row, stalledIds), planning);
    }

    public async Task<IReadOnlyList<PublicEventSummary>> GetPublicEventsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();

        return await _publicFace
            .Events.OrderBy(row => row.CalendarEntry!.StartsAt)
            .ThenBy(row => row.CalendarEntryId)
            .Select(PublicSummaryAt(now))
            .ToListAsync(ct);
    }

    public async Task<PublicEventDetails?> GetPublicEventAsync(int eventId, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();

        return await _publicFace
            .Events.Where(row => row.CalendarEntryId == eventId)
            .Select(PublicDetailsAt(now))
            .SingleOrDefaultAsync(ct);
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

    public async Task<Result> PublishAsync(int eventId, CancellationToken ct)
    {
        var entry = await TrackedEventEntryAsync(eventId, ct);

        if (entry is null)
            return Result.NotFound(UnknownEventMessage);

        var now = _timeProvider.GetUtcNow();
        if (PublishRefusalOf(entry, now) is { } refusal)
            return Result.Conflict(refusal);

        entry.Event!.PublishedAt = now;
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

        await _dbContext.KeepSessionOfAlbumsOnAsync(entry, ct);
        _dbContext.CalendarEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private static void Apply(CalendarEntry entry, EventFactsCommand facts, DateTimeOffset now)
    {
        var held = entry.Event!;

        entry.Title = facts.Title;
        entry.StartsAt = facts.StartsAt;
        entry.EndsAt = null;
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
    private static string? PublishRefusalOf(CalendarEntry entry, DateTimeOffset now)
    {
        var held = entry.Event!;

        if (held.PublishedAt is not null)
            return AlreadyPublishedMessage;

        if (held.CancelledAt is not null)
            return CancelledUnpublishableMessage;

        if (IsOver(entry.StartsAt, entry.EndsAt, now))
            return OverMessage;

        var missing = EventDetailsCheck.MissingBeforePublishingOf(DetailsFactsOf(entry));

        return missing.Count == 0 ? null : MissingDetailsMessage(missing);
    }

    [Pure]
    private static EventDetailsFacts DetailsFactsOf(CalendarEntry entry) =>
        new()
        {
            HasVenue = entry.VenueId is not null,
            HasDoorsOpenAt = entry.Event!.DoorsOpenAt is not null,
            HasDescription = !string.IsNullOrWhiteSpace(entry.Description),
            HasPicture = entry.Event.PictureId is not null,
            IsPublished = entry.Event.PublishedAt is not null,
        };

    [Pure]
    private static string MissingDetailsMessage(IReadOnlyList<MissingEventDetail> missing) =>
        $"{MissingDetailsLead}{string.Join(", ", missing.Select(detail => DetailLabels[detail]))}.";

    [Pure]
    private static bool IsOver(
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt,
        DateTimeOffset now
    ) => (endsAt ?? startsAt.AddHours(CalendarDefaults.OpenEndedHours)) <= now;

    [Pure]
    private static string OpenRequestsMessage(int openRequests) =>
        openRequests == 1
            ? "Zu dieser Veranstaltung ist noch 1 Kartenanfrage offen. Erledige sie, bevor du die Veranstaltung löschst."
            : $"Zu dieser Veranstaltung sind noch {openRequests} Kartenanfragen offen. Erledige sie, bevor du die Veranstaltung löschst.";

    [Pure]
    private static EventSummary ToSummary(
        SummaryRow row,
        DateTimeOffset now,
        PictureDetails? picture,
        EventPlanning planning
    ) =>
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
            Picture = picture,
            DoorsOpenAt = row.DoorsOpenAt,
            PriceCents = row.PriceCents,
            PublishedAt = row.PublishedAt,
            CreatedAt = row.CreatedAt,
            Planning = planning,
        };

    [Pure]
    private static EventDetails ToDetails(
        DetailsRow row,
        DateTimeOffset now,
        PictureEditingDetails? picture,
        EventPlanning planning
    ) =>
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
            Picture = picture,
            PublishedAt = row.PublishedAt,
            CreatedAt = row.CreatedAt,
            Planning = planning,
        };

    [Pure]
    private static PlanningInputs PlanningInputsOf(SummaryRow row) =>
        new(
            row.StartsAt,
            row.CreatedAt,
            row.CancelledAt is not null,
            row.IsOver,
            new EventDetailsFacts
            {
                HasVenue = row.HasVenue,
                HasDoorsOpenAt = row.DoorsOpenAt is not null,
                HasDescription = row.HasDescription,
                HasPicture = row.PictureId is not null,
                IsPublished = row.PublishedAt is not null,
            },
            row.PriceCents is not null && row.PresaleStartsAt is not null
        );

    [Pure]
    private static PlanningInputs PlanningInputsOf(DetailsRow row) =>
        new(
            row.StartsAt,
            row.CreatedAt,
            row.CancelledAt is not null,
            row.IsOver,
            new EventDetailsFacts
            {
                HasVenue = row.VenueId is not null,
                HasDoorsOpenAt = row.DoorsOpenAt is not null,
                HasDescription = !string.IsNullOrWhiteSpace(row.Description),
                HasPicture = row.Picture is not null,
                IsPublished = row.PublishedAt is not null,
            },
            row.PriceCents is not null && row.PresaleStartsAt is not null
        );

    [Pure]
    private static EventPlanning PlanningOf(
        PlanningInputs inputs,
        TallyRow? tally,
        bool isRunningOrderSettled,
        DateTimeOffset now
    )
    {
        var detailsMissing = EventDetailsCheck.MissingOf(inputs.Details);
        var facts = new EventReadinessFacts
        {
            EventDay = ClubClock.DayOf(inputs.StartsAt),
            CreatedDay = ClubClock.DayOf(inputs.CreatedAt),
            IsCancelled = inputs.IsCancelled,
            IsOver = inputs.IsOver,
            AreDetailsDone = detailsMissing.Count == 0,
            AreTicketsSet = inputs.AreTicketsSet,
            OldestOpenRequestAt = tally?.OldestRequestedAt,
            IsRunningOrderDone = isRunningOrderSettled,
            HasPublishedAlbum = tally?.PublishedAlbums > 0,
        };

        return new EventPlanning
        {
            DetailsMissing = detailsMissing,
            TicketRequests = new EventTicketRequestTally
            {
                Open = tally?.OpenRequests ?? 0,
                Cards = tally?.Cards ?? 0,
                OldestRequestedAt = tally?.OldestRequestedAt,
            },
            Review = new EventReviewTally
            {
                PublishedAlbums = tally?.PublishedAlbums ?? 0,
                PublishedNews = tally?.PublishedNews ?? 0,
            },
            Readiness = EventSteps.ReadinessOf(facts, now),
        };
    }

    [Pure]
    private static Expression<Func<Event, PublicEventSummary>> PublicSummaryAt(
        DateTimeOffset now
    ) =>
        row => new PublicEventSummary
        {
            EventId = row.CalendarEntryId,
            Title = row.CalendarEntry!.Title,
            StartsAt = row.CalendarEntry.StartsAt,
            EndsAt = row.CalendarEntry.EndsAt,
            DoorsOpenAt = DoorsOpenInstantOf(row.CalendarEntry.StartsAt, row.DoorsOpenAt),
            Venue = new PublicEventVenue
            {
                Name = row.CalendarEntry.Venue!.Name,
                Street = row.CalendarEntry.Venue.Street,
                Zip = row.CalendarEntry.Venue.Zip,
                City = row.CalendarEntry.Venue.City,
                Hint = row.CalendarEntry.Venue.Hint,
            },
            Teaser = row.Teaser,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = EventSales.StatusOf(
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt != null,
                now
            ),
            Picture = PublicEventPictures.Of(
                row.PictureId,
                row.Picture == null ? null : row.Picture.RenderedAt,
                row.Picture == null ? null : row.Picture.Width,
                row.Picture == null ? null : row.Picture.Height,
                row.Picture == null ? null : row.Picture.Crop
            ),
        };

    [Pure]
    private static Expression<Func<Event, PublicEventDetails>> PublicDetailsAt(
        DateTimeOffset now
    ) =>
        row => new PublicEventDetails
        {
            EventId = row.CalendarEntryId,
            Title = row.CalendarEntry!.Title,
            StartsAt = row.CalendarEntry.StartsAt,
            EndsAt = row.CalendarEntry.EndsAt,
            DoorsOpenAt = DoorsOpenInstantOf(row.CalendarEntry.StartsAt, row.DoorsOpenAt),
            Venue = new PublicEventVenue
            {
                Name = row.CalendarEntry.Venue!.Name,
                Street = row.CalendarEntry.Venue.Street,
                Zip = row.CalendarEntry.Venue.Zip,
                City = row.CalendarEntry.Venue.City,
                Hint = row.CalendarEntry.Venue.Hint,
            },
            Teaser = row.Teaser,
            Description = row.CalendarEntry.Description,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = EventSales.StatusOf(
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt != null,
                now
            ),
            Picture = PublicEventPictures.Of(
                row.PictureId,
                row.Picture == null ? null : row.Picture.RenderedAt,
                row.Picture == null ? null : row.Picture.Width,
                row.Picture == null ? null : row.Picture.Height,
                row.Picture == null ? null : row.Picture.Crop
            ),
        };

    [Pure]
    private static DateTimeOffset? DoorsOpenInstantOf(
        DateTimeOffset startsAt,
        TimeOnly? doorsOpenAt
    ) => doorsOpenAt is { } time ? ClubClock.At(ClubClock.DayOf(startsAt), time) : null;

    private PictureEditingDetails? EditingOf(DetailsRow row, IReadOnlySet<int> stalledIds) =>
        row.Picture is { } picture
            ? _pictures.EditingOf(MediaOwner.Event(row.EventId), picture, stalledIds)
            : null;

    private async Task<IReadOnlyDictionary<int, TallyRow>> TalliesOfAsync(
        IReadOnlyList<int> eventIds,
        CancellationToken ct
    )
    {
        var requests = _dbContext.TicketRequests.AsNoTracking();
        var albums = _publicFace.Albums;
        var posts = _publicFace.NewsPosts;

        return await _dbContext
            .Events.AsNoTracking()
            .Where(row => eventIds.Contains(row.CalendarEntryId))
            .Select(row => new TallyRow(
                row.CalendarEntryId,
                requests.Count(request => request.EventId == row.CalendarEntryId),
                requests
                    .Where(request => request.EventId == row.CalendarEntryId)
                    .Sum(request => request.TicketCount),
                requests
                    .Where(request => request.EventId == row.CalendarEntryId)
                    .Min(request => (DateTimeOffset?)request.RequestedAt),
                albums.Count(album => album.CalendarEntryId == row.CalendarEntryId),
                posts.Count(post => post.EventId == row.CalendarEntryId)
            ))
            .ToDictionaryAsync(tally => tally.EventId, ct);
    }

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
        bool IsOver,
        int? PictureId,
        DateTimeOffset? PictureRenderedAt,
        TimeOnly? DoorsOpenAt,
        int? PriceCents,
        bool HasVenue,
        bool HasDescription,
        DateTimeOffset CreatedAt,
        DateTimeOffset? PublishedAt
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
        bool IsOver,
        MediaPictureRow? Picture,
        DateTimeOffset CreatedAt,
        DateTimeOffset? PublishedAt
    );

    private sealed record PlanningInputs(
        DateTimeOffset StartsAt,
        DateTimeOffset CreatedAt,
        bool IsCancelled,
        bool IsOver,
        EventDetailsFacts Details,
        bool AreTicketsSet
    );

    private sealed record TallyRow(
        int EventId,
        int OpenRequests,
        int Cards,
        DateTimeOffset? OldestRequestedAt,
        int PublishedAlbums,
        int PublishedNews
    );

    private sealed record VenueStateRow(DateOnly? ArchivedOn);
}
