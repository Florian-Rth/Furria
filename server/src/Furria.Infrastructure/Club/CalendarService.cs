using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Groups;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string UnknownEntryMessage = "Diesen Kalendereintrag gibt es nicht.";
    private const string NoPersonMessage = "Dieser Zugang gehört zu keiner Person.";
    private const string NotYoursMessage = "Auf diesen Kalendereintrag kannst du nicht antworten.";
    private const string NotOwnedMessage = "Diesen Kalendereintrag darfst du nicht pflegen.";
    private const string NoResponseWantedMessage = "Dieser Eintrag fragt nicht nach einer Antwort.";
    private const string DuplicateResponseMessage =
        WriteConflictMessages.DuplicateAttendanceResponse;
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage =
        "Ein archivierter Ort kann nicht mehr gewählt werden.";
    private const string UnknownOwnerGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string ArchivedParticipatingGroupMessage =
        "Eine archivierte Gruppe kann nicht mitwirken.";
    private const string EventsLiveInTheWorkbenchMessage =
        "Eine Veranstaltung wird in den Veranstaltungen gepflegt.";
    private const string ArchivedAudienceGroupMessage =
        "Eine archivierte Gruppe kann nicht gewählt werden.";
    private const string UnchoosablePersonMessage = "Diese Person kann nicht ausgewählt werden.";
    private const string NoParticipatingGroupMessage = "Wähle mindestens eine mitwirkende Gruppe.";

    private static readonly CalendarRights SeesEveryClubEntry = new(
        HoldsClubRead: true,
        ManagesClubCalendar: false
    );

    private static readonly IReadOnlyDictionary<int, AttendanceAnswer> NoAnswers =
        new Dictionary<int, AttendanceAnswer>();

    private static readonly IReadOnlyDictionary<
        VenueCollisionQuery,
        IReadOnlyList<CalendarEntrySummary>
    > NoCollisions = new Dictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>>();

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly MediaPictures _pictures;
    private readonly TimeProvider _timeProvider;

    public CalendarService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        MediaPictures pictures,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _pictures = pictures;
        _timeProvider = timeProvider;
    }

    public async Task<Result<IReadOnlyList<CalendarEntrySummary>>> GetEntriesAsync(
        CalendarWindowQuery query,
        CancellationToken ct
    )
    {
        if (await ViewerOfAsync(query.ViewerAccountId, ct) is not { } viewer)
            return Result<IReadOnlyList<CalendarEntrySummary>>.Forbidden(NoPersonMessage);

        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var windowStart = ClubClock.StartOfDay(query.From);
        var windowEnd = ClubClock.StartOfDay(query.To.AddDays(1));

        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry =>
                entry.StartsAt < windowEnd
                && (
                    entry.EndsAt == null
                        ? entry.StartsAt >= windowStart
                        : entry.EndsAt > windowStart
                )
            )
            .Where(entry => !query.ClubOwnedOnly || entry.OwnerGroupId == null)
            .Where(entry => query.OwnerGroupId == null || entry.OwnerGroupId == query.OwnerGroupId)
            .Where(VisibleTo(viewer.PersonId, viewer.Rights, today))
            .Where(PublishedEvents.IsListedEntry)
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, openEndedCutoff))
            .ToListAsync(ct);

        var extras = await ExtrasOfAsync(viewer.PersonId, rows, now, ct);

        return Result<IReadOnlyList<CalendarEntrySummary>>.Success([
            .. rows.Select(row => ToSummary(row, extras, now)),
        ]);
    }

    public async Task<Result<CalendarEntrySummary>> GetEntryAsync(
        int viewerAccountId,
        int calendarEntryId,
        CancellationToken ct
    )
    {
        if (await ViewerOfAsync(viewerAccountId, ct) is not { } viewer)
            return Result<CalendarEntrySummary>.Forbidden(NoPersonMessage);

        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        var row = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.Id == calendarEntryId)
            .Where(VisibleTo(viewer.PersonId, viewer.Rights, today))
            .Where(PublishedEvents.IsListedEntry)
            .Select(RowProjection(now, openEndedCutoff))
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<CalendarEntrySummary>.NotFound(UnknownEntryMessage);

        var extras = await ExtrasOfAsync(viewer.PersonId, [row], now, ct);

        return Result<CalendarEntrySummary>.Success(ToSummary(row, extras, now));
    }

    public async Task<IReadOnlyList<GroupCalendarEntrySummary>> GetGroupEntriesAsync(
        GroupCalendarQuery query,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var personId = query.ViewerPersonId;
        var groupId = query.GroupId;
        var windowStart = ClubClock.StartOfDay(query.From);
        var windowEnd = ClubClock.StartOfDay(query.To.AddDays(1));
        var rights = await RightsOfAsync(query.ViewerAccountId, ct);
        var sight = rights with { HoldsClubRead = true };

        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.StartsAt >= windowStart && entry.StartsAt < windowEnd)
            .Where(entry =>
                entry.OwnerGroupId == groupId
                || entry.ParticipatingGroups.Any(link => link.GroupId == groupId)
                || entry.AudienceGroups.Any(link => link.GroupId == groupId)
            )
            .Where(VisibleTo(personId, sight, today))
            .Where(PublishedEvents.IsListedEntry)
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, openEndedCutoff))
            .ToListAsync(ct);

        var extras = await ExtrasOfAsync(personId, rows, now, ct);
        var ties = await _dbContext.CalendarTiesOfAsync(personId, today, ct);

        return
        [
            .. rows.Select(row =>
                ToGroupSummary(ToSummary(row, extras, now), MayAnswer(row, ties, rights))
            ),
        ];
    }

    public async Task<IReadOnlyList<CalendarEntrySummary>> FindVenueCollisionsAsync(
        VenueCollisionQuery query,
        CancellationToken ct
    )
    {
        var found = await FindVenueCollisionsAsync([query], ct);

        return found.TryGetValue(query, out var collisions) ? collisions : [];
    }

    public async Task<
        IReadOnlyDictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>>
    > FindVenueCollisionsAsync(IReadOnlyList<VenueCollisionQuery> probes, CancellationToken ct)
    {
        if (probes.Count == 0)
            return NoCollisions;

        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var found = new Dictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>>();

        foreach (var perViewer in probes.Distinct().GroupBy(probe => probe.ViewerPersonId))
        {
            var wanted = perViewer.ToList();
            var venueIds = wanted.Select(probe => probe.VenueId).Distinct().ToList();
            var windowStart = wanted
                .Min(probe => probe.StartsAt)
                .AddHours(-CalendarDefaults.OpenEndedHours);
            var windowEnd = wanted.Max(ProbeEndOf);

            var rows = await _dbContext
                .CalendarEntries.AsNoTracking()
                .Where(entry => entry.VenueId != null && venueIds.Contains(entry.VenueId.Value))
                .Where(entry =>
                    entry.StartsAt < windowEnd
                    && (
                        entry.EndsAt == null
                            ? entry.StartsAt > windowStart
                            : entry.EndsAt > windowStart
                    )
                )
                .Where(VisibleTo(perViewer.Key, SeesEveryClubEntry, today))
                .OrderBy(entry => entry.StartsAt)
                .ThenBy(entry => entry.Id)
                .Select(RowProjection(now, openEndedCutoff))
                .ToListAsync(ct);

            foreach (var probe in wanted)
            {
                found[probe] =
                [
                    .. rows.Where(row => Collides(row, probe))
                        .Select(row => ToSummary(row, EntryExtras.Nothing, now)),
                ];
            }
        }

        return found;
    }

    public async Task<Result<CalendarEntryWriteResult>> CreateAsync(
        CreateCalendarEntryCommand command,
        CancellationToken ct
    )
    {
        if (!await MayOwnAsync(command.ActorAccountId, command.OwnerGroupId, ct))
            return Result<CalendarEntryWriteResult>.Forbidden(NotOwnedMessage);

        var participatingGroupIds = ParticipationOf(
            command.ParticipatingGroupIds,
            command.OwnerGroupId
        );

        var addOnKinds = CalendarAddOnRecords.KindsOf(command.AddOns);

        if (AddOnRefusalOf(addOnKinds, participatingGroupIds) is { } addOnRefusal)
            return Result<CalendarEntryWriteResult>.Validation(addOnRefusal);

        var audience = AudienceChoice.Of(
            command.Audience,
            command.AudienceGroupIds,
            command.AudiencePersonIds
        );

        var refusal = await PlacementRefusalAsync(
            new Placement(command.OwnerGroupId, command.VenueId, participatingGroupIds, audience),
            AudienceHeld.Nothing,
            ct
        );

        if (refusal is not null)
            return Result<CalendarEntryWriteResult>.Validation(refusal);

        var entry = new CalendarEntry
        {
            Title = command.Title,
            Description = command.Description,
            OwnerGroupId = command.OwnerGroupId,
            VenueId = command.VenueId,
            StartsAt = command.StartsAt,
            EndsAt = command.EndsAt,
            Kind = command.Kind,
            Audience = audience.Audience,
        };
        CalendarEntryAddOns.Attach(entry, addOnKinds);
        Reconcile(entry, participatingGroupIds, audience);

        if (await _dbContext.ReconcilePollsAsync(entry, command.AddOns, ct) is { } pollRefusal)
            return Result<CalendarEntryWriteResult>.Validation(pollRefusal);

        if (
            CalendarSignUpListRecords.ReconcileSignUpLists(entry, command.AddOns) is { } listRefusal
        )
            return Result<CalendarEntryWriteResult>.Validation(listRefusal);

        _dbContext.CalendarEntries.Add(entry);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<CalendarEntryWriteResult>.Carrying(saved);

        return Result<CalendarEntryWriteResult>.Success(
            await WrittenAsync(entry, command.ViewerPersonId, ct)
        );
    }

    public async Task<Result<CalendarEntryWriteResult>> UpdateAsync(
        UpdateCalendarEntryCommand command,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var entry = await LockedEntryAsync(command.CalendarEntryId, ct);

        if (entry is null)
            return Result<CalendarEntryWriteResult>.NotFound(UnknownEntryMessage);

        if (
            !await MayOwnAsync(command.ActorAccountId, entry.OwnerGroupId, ct)
            || !await MayOwnAsync(command.ActorAccountId, command.OwnerGroupId, ct)
        )
            return Result<CalendarEntryWriteResult>.Forbidden(NotOwnedMessage);

        if (entry.Kind == CalendarEntryKind.Event)
            return Result<CalendarEntryWriteResult>.Conflict(EventsLiveInTheWorkbenchMessage);

        var participatingGroupIds = ParticipationOf(
            command.ParticipatingGroupIds,
            command.OwnerGroupId
        );

        var addOnKinds = CalendarAddOnRecords.KindsOf(command.AddOns);

        if (AddOnRefusalOf(addOnKinds, participatingGroupIds) is { } addOnRefusal)
            return Result<CalendarEntryWriteResult>.Validation(addOnRefusal);

        var audience = AudienceChoice.Of(
            command.Audience,
            command.AudienceGroupIds,
            command.AudiencePersonIds
        );

        var refusal = await PlacementRefusalAsync(
            new Placement(command.OwnerGroupId, command.VenueId, participatingGroupIds, audience),
            new AudienceHeld(
                [.. entry.AudienceGroups.Select(link => link.GroupId)],
                [.. entry.AudiencePeople.Select(link => link.PersonId)]
            ),
            ct
        );

        if (refusal is not null)
            return Result<CalendarEntryWriteResult>.Validation(refusal);

        if (await _dbContext.ReconcilePollsAsync(entry, command.AddOns, ct) is { } pollRefusal)
            return Result<CalendarEntryWriteResult>.Validation(pollRefusal);

        if (
            CalendarSignUpListRecords.ReconcileSignUpLists(entry, command.AddOns) is { } listRefusal
        )
            return Result<CalendarEntryWriteResult>.Validation(listRefusal);

        if (DropsAttendance(entry, addOnKinds))
            await DiscardAnswersAsync(entry.Id, ct);

        CalendarEntryAddOns.Attach(entry, addOnKinds);
        Reconcile(entry, participatingGroupIds, audience);

        entry.Title = command.Title;
        entry.Description = command.Description;
        entry.OwnerGroupId = command.OwnerGroupId;
        entry.VenueId = command.VenueId;
        entry.StartsAt = command.StartsAt;
        entry.EndsAt = command.EndsAt;
        entry.Kind = command.Kind;
        entry.Audience = audience.Audience;

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<CalendarEntryWriteResult>.Carrying(saved);

        await transaction.CommitAsync(ct);
        return Result<CalendarEntryWriteResult>.Success(
            await WrittenAsync(entry, command.ViewerPersonId, ct)
        );
    }

    public async Task<Result> DeleteAsync(
        int actorAccountId,
        int calendarEntryId,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var entry = await LockedEntryAsync(calendarEntryId, ct);

        if (entry is null)
            return Result.NotFound(UnknownEntryMessage);

        if (!await MayOwnAsync(actorAccountId, entry.OwnerGroupId, ct))
            return Result.Forbidden(NotOwnedMessage);

        if (entry.Kind == CalendarEntryKind.Event)
            return Result.Conflict(EventsLiveInTheWorkbenchMessage);

        await _dbContext.KeepSessionOfAlbumsOnAsync(entry, ct);
        _dbContext.CalendarEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result> SetResponseAsync(
        SetAttendanceResponseCommand command,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotYoursMessage);

        var rights = await RightsOfAsync(command.ActorAccountId, ct);
        var entry = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(row => row.Id == command.CalendarEntryId)
            .Select(EntryFactsRows.Projection)
            .SingleOrDefaultAsync(ct);
        var ties = await _dbContext.CalendarTiesOfAsync(
            personId,
            ClubClock.Today(_timeProvider),
            ct
        );

        if (entry is null || !ties.Sees(entry.ToFacts(), rights))
        {
            return rights.HoldsClubRead
                ? Result.NotFound(UnknownEntryMessage)
                : Result.Forbidden(NotYoursMessage);
        }

        if (!entry.AsksForResponse)
            return Result.Validation(NoResponseWantedMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await _dbContext.StillAsksForResponseAsync(command.CalendarEntryId, ct))
            return Result.Validation(NoResponseWantedMessage);

        _dbContext.Record(
            await _dbContext.LockedResponseAsync(command.CalendarEntryId, personId, ct),
            new AttendanceRecord(
                command.CalendarEntryId,
                personId,
                command.Answer,
                IsRecordedOnBehalf: false,
                RecordedByPersonId: null
            ),
            _timeProvider.GetUtcNow()
        );

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result.Conflict(DuplicateResponseMessage);

        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private Expression<Func<CalendarEntry, EntryRow>> RowProjection(
        DateTimeOffset now,
        DateTimeOffset openEndedCutoff
    )
    {
        var responses = _dbContext.AttendanceResponses;

        return entry => new EntryRow(
            entry.Id,
            entry.Title,
            entry.StartsAt,
            entry.EndsAt,
            entry.Kind,
            entry.VenueId,
            entry.Venue!.Name,
            entry.OwnerGroupId,
            entry.OwnerGroup!.Name,
            entry.OwnerGroup!.Tone,
            entry
                .ParticipatingGroups.OrderBy(link =>
                    EF.Functions.Collate(link.Group!.Name, GermanCollation.Name)
                )
                .Select(link => new GroupRow(link.GroupId, link.Group!.Name, link.Group!.Tone))
                .ToList(),
            new AudienceNamesRow(
                entry.Audience,
                entry
                    .AudienceGroups.OrderBy(link =>
                        EF.Functions.Collate(link.Group!.Name, GermanCollation.Name)
                    )
                    .Select(link => new GroupRow(link.GroupId, link.Group!.Name, link.Group!.Tone))
                    .ToList(),
                entry
                    .AudiencePeople.OrderBy(link =>
                        EF.Functions.Collate(link.Person!.FirstName, GermanCollation.Name)
                    )
                    .ThenBy(link =>
                        EF.Functions.Collate(link.Person!.LastName, GermanCollation.Name)
                    )
                    .Select(link => new PersonRow(
                        link.PersonId,
                        link.Person!.FirstName,
                        link.Person!.LastName
                    ))
                    .ToList()
            ),
            entry.AsksForResponse,
            new AddOnPositionsRow(entry.AttendancePosition, entry.ParticipatingGroupsPosition),
            responses.Count(response => response.CalendarEntryId == entry.Id),
            entry.Description,
            entry.StartsAt <= now
                && (entry.EndsAt == null ? entry.StartsAt > openEndedCutoff : entry.EndsAt > now),
            entry.Event == null
                ? null
                : new EventFactsRow(
                    entry.Event.DoorsOpenAt,
                    entry.Event.Teaser,
                    entry.Event.AgeHint,
                    entry.Event.PriceCents,
                    entry.Event.PresaleStartsAt,
                    entry.Event.TicketAvailability,
                    entry.Event.CancelledAt,
                    entry.Event.PictureId,
                    entry.Event.Picture == null ? null : entry.Event.Picture.RenderedAt
                )
        );
    }

    [Pure]
    private static string? AddOnRefusalOf(
        IReadOnlyList<CalendarEntryAddOnKind> addOns,
        IReadOnlyList<int> participatingGroupIds
    ) =>
        addOns.Contains(CalendarEntryAddOnKind.ParticipatingGroups)
        && participatingGroupIds.Count == 0
            ? NoParticipatingGroupMessage
            : null;

    [Pure]
    private static bool DropsAttendance(
        CalendarEntry entry,
        IReadOnlyList<CalendarEntryAddOnKind> addOns
    ) => entry.AsksForResponse && !addOns.Contains(CalendarEntryAddOnKind.Attendance);

    [Pure]
    private static bool MayAnswer(EntryRow row, CalendarTies ties, CalendarRights rights) =>
        row.AsksForResponse && ties.Sees(FactsOf(row), rights);

    [Pure]
    private static CalendarEntryFacts FactsOf(EntryRow row) =>
        new()
        {
            OwnerGroupId = row.OwnerGroupId,
            ParticipatingGroupIds = [.. row.ParticipatingGroups.Select(group => group.GroupId)],
            Audience = row.Audience.Audience,
            AudienceGroupIds = [.. row.Audience.Groups.Select(group => group.GroupId)],
            AudiencePersonIds = [.. row.Audience.People.Select(person => person.PersonId)],
            Kind = row.Kind,
            AsksForResponse = row.AsksForResponse,
            StartsAt = row.StartsAt,
        };

    [Pure]
    private static DateTimeOffset ProbeEndOf(VenueCollisionQuery probe) =>
        probe.EndsAt ?? probe.StartsAt.AddHours(CalendarDefaults.OpenEndedHours);

    [Pure]
    private static bool Collides(EntryRow entry, VenueCollisionQuery probe) =>
        entry.VenueId == probe.VenueId
        && entry.CalendarEntryId != probe.ExcludeCalendarEntryId
        && entry.StartsAt < ProbeEndOf(probe)
        && (
            entry.EndsAt == null
                ? entry.StartsAt > probe.StartsAt.AddHours(-CalendarDefaults.OpenEndedHours)
                : entry.EndsAt > probe.StartsAt
        );

    [Pure]
    private static IReadOnlyList<int> ParticipationOf(
        IReadOnlyList<int> wanted,
        int? ownerGroupId
    ) => [.. wanted.Where(groupId => groupId != ownerGroupId).Distinct()];

    private static void Reconcile(
        CalendarEntry entry,
        IReadOnlyList<int> participatingGroupIds,
        AudienceChoice audience
    )
    {
        ReconcileLinks(
            entry.ParticipatingGroups,
            participatingGroupIds,
            link => link.GroupId,
            groupId => new CalendarEntryGroup { GroupId = groupId }
        );
        ReconcileLinks(
            entry.AudienceGroups,
            audience.GroupIds,
            link => link.GroupId,
            groupId => new CalendarEntryAudienceGroup { GroupId = groupId }
        );
        ReconcileLinks(
            entry.AudiencePeople,
            audience.PersonIds,
            link => link.PersonId,
            personId => new CalendarEntryAudiencePerson { PersonId = personId }
        );
    }

    private static void ReconcileLinks<TLink>(
        ICollection<TLink> links,
        IReadOnlyList<int> wantedIds,
        Func<TLink, int> idOf,
        Func<int, TLink> linkTo
    )
    {
        foreach (var dropped in links.Where(link => !wantedIds.Contains(idOf(link))).ToList())
            links.Remove(dropped);

        var held = links.Select(idOf).ToHashSet();

        foreach (var id in wantedIds.Where(id => !held.Contains(id)))
            links.Add(linkTo(id));
    }

    [Pure]
    private static ParticipatingGroup ToParticipatingGroup(GroupRow row) =>
        new()
        {
            GroupId = row.GroupId,
            Name = row.Name,
            Tone = row.Tone,
        };

    [Pure]
    private static AudienceGroup ToAudienceGroup(GroupRow row) =>
        new()
        {
            GroupId = row.GroupId,
            Name = row.Name,
            Tone = row.Tone,
        };

    [Pure]
    private static AudiencePerson ToAudiencePerson(PersonRow row) =>
        new()
        {
            PersonId = row.PersonId,
            FirstName = row.FirstName,
            LastName = row.LastName,
        };

    private CalendarEntrySummary ToSummary(EntryRow row, EntryExtras extras, DateTimeOffset now) =>
        new()
        {
            CalendarEntryId = row.CalendarEntryId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            Kind = row.Kind,
            VenueId = row.VenueId,
            VenueName = row.VenueName,
            OwnerGroupId = row.OwnerGroupId,
            OwnerGroupName = row.OwnerGroupName,
            OwnerGroupTone = row.OwnerGroupTone,
            ParticipatingGroups = [.. row.ParticipatingGroups.Select(ToParticipatingGroup)],
            Audience = row.Audience.Audience,
            AudienceGroups = [.. row.Audience.Groups.Select(ToAudienceGroup)],
            AudiencePeople = [.. row.Audience.People.Select(ToAudiencePerson)],
            AsksForResponse = row.AsksForResponse,
            AddOns = CalendarAddOnRecords.InCardOrder(
                row.AddOnPositions.Attendance,
                row.AddOnPositions.ParticipatingGroups,
                extras.Polls.TryGetValue(row.CalendarEntryId, out var polls) ? polls : [],
                extras.SignUpLists.TryGetValue(row.CalendarEntryId, out var lists) ? lists : []
            ),
            ResponseCount = row.ResponseCount,
            Description = row.Description,
            ViewerAnswer = extras.Answers.TryGetValue(row.CalendarEntryId, out var answer)
                ? answer
                : null,
            IsRunning = row.IsRunning,
            Event = row.Event is { } facts
                ? ToEventFacts(facts, now, EventPictureOf(row.CalendarEntryId, facts))
                : null,
        };

    private PictureDetails? EventPictureOf(int eventId, EventFactsRow facts) =>
        _pictures.Of(MediaOwner.Event(eventId), facts.PictureId, facts.PictureRenderedAt);

    [Pure]
    private static CalendarEventFacts ToEventFacts(
        EventFactsRow row,
        DateTimeOffset now,
        PictureDetails? picture
    ) =>
        new()
        {
            DoorsOpenAt = row.DoorsOpenAt,
            Teaser = row.Teaser,
            AgeHint = row.AgeHint,
            PriceCents = row.PriceCents,
            PresaleStartsAt = row.PresaleStartsAt,
            Status = EventSales.StatusOf(
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt is not null,
                now
            ),
            Picture = picture,
        };

    [Pure]
    private static GroupCalendarEntrySummary ToGroupSummary(
        CalendarEntrySummary entry,
        bool viewerMayAnswer
    ) => new() { Entry = entry, ViewerMayAnswer = viewerMayAnswer };

    private Task<bool> MayOwnAsync(int actorAccountId, int? ownerGroupId, CancellationToken ct) =>
        ownerGroupId is { } groupId
            ? _authorizer.CanAdministerGroupAsync(actorAccountId, groupId, ct)
            : _authorizer.IsGrantedAsync(actorAccountId, FurriaPermissions.CalendarManageClub, ct);

    private async Task<CalendarEntry?> LockedEntryAsync(int calendarEntryId, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM calendar_entry WHERE id = {calendarEntryId} FOR UPDATE",
            ct
        );

        return await _dbContext
            .CalendarEntries.Include(row => row.ParticipatingGroups)
            .Include(row => row.AudienceGroups)
            .Include(row => row.AudiencePeople)
            .Include(row => row.Polls)
                .ThenInclude(poll => poll.Options)
            .Include(row => row.SignUpLists)
            .AsSplitQuery()
            .SingleOrDefaultAsync(row => row.Id == calendarEntryId, ct);
    }

    private async Task DiscardAnswersAsync(int calendarEntryId, CancellationToken ct)
    {
        await _dbContext
            .AttendanceResponseChanges.Where(change => change.CalendarEntryId == calendarEntryId)
            .ExecuteDeleteAsync(ct);
        await _dbContext
            .AttendanceResponses.Where(response => response.CalendarEntryId == calendarEntryId)
            .ExecuteDeleteAsync(ct);
    }

    private async Task<CalendarEntryWriteResult> WrittenAsync(
        CalendarEntry entry,
        int? viewerPersonId,
        CancellationToken ct
    ) =>
        new()
        {
            CalendarEntryId = entry.Id,
            VenueCollisions = await CollisionsOfAsync(entry, viewerPersonId, ct),
        };

    private async Task<IReadOnlyList<CalendarEntrySummary>> CollisionsOfAsync(
        CalendarEntry entry,
        int? viewerPersonId,
        CancellationToken ct
    )
    {
        if (entry.VenueId is not { } venueId)
            return [];

        return await FindVenueCollisionsAsync(
            new VenueCollisionQuery
            {
                ViewerPersonId = viewerPersonId,
                VenueId = venueId,
                StartsAt = entry.StartsAt,
                EndsAt = entry.EndsAt,
                ExcludeCalendarEntryId = entry.Id,
            },
            ct
        );
    }

    private async Task<string?> PlacementRefusalAsync(
        Placement placement,
        AudienceHeld held,
        CancellationToken ct
    )
    {
        if (placement.OwnerGroupId is { } ownerGroupId && !await GroupExistsAsync(ownerGroupId, ct))
            return UnknownOwnerGroupMessage;

        return await GroupsRefusalAsync(
                placement.ParticipatingGroupIds,
                ArchivedParticipatingGroupMessage,
                ct
            )
            ?? await GroupsRefusalAsync(
                [.. placement.Audience.GroupIds.Except(held.GroupIds)],
                ArchivedAudienceGroupMessage,
                ct
            )
            ?? await ChosenPeopleRefusalAsync(
                [.. placement.Audience.PersonIds.Except(held.PersonIds)],
                ct
            )
            ?? (placement.VenueId is { } venueId ? await VenueRefusalAsync(venueId, ct) : null);
    }

    private async Task<string?> ChosenPeopleRefusalAsync(
        IReadOnlyList<int> newlyChosenIds,
        CancellationToken ct
    )
    {
        if (newlyChosenIds.Count == 0)
            return null;

        var choosableCount = await _dbContext
            .ChoosablePersonIds(ClubClock.Today(_timeProvider))
            .Where(personId => newlyChosenIds.Contains(personId))
            .Distinct()
            .CountAsync(ct);

        return choosableCount == newlyChosenIds.Count ? null : UnchoosablePersonMessage;
    }

    private async Task<string?> VenueRefusalAsync(int venueId, CancellationToken ct)
    {
        var venue = await _dbContext
            .Venues.AsNoTracking()
            .Where(row => row.Id == venueId)
            .Select(row => new VenueStateRow(row.Id, row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

        if (venue is null)
            return UnknownVenueMessage;

        return venue.ArchivedOn is null ? null : ArchivedVenueMessage;
    }

    private async Task<string?> GroupsRefusalAsync(
        IReadOnlyList<int> groupIds,
        string archivedMessage,
        CancellationToken ct
    )
    {
        if (groupIds.Count == 0)
            return null;

        var groups = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => groupIds.Contains(group.Id))
            .Select(group => new GroupStateRow(group.Id, group.ArchivedOn))
            .ToListAsync(ct);

        if (groups.Count != groupIds.Count)
            return UnknownOwnerGroupMessage;

        return groups.Any(group => group.ArchivedOn is not null) ? archivedMessage : null;
    }

    private Task<bool> GroupExistsAsync(int groupId, CancellationToken ct) =>
        _dbContext.Groups.AsNoTracking().AnyAsync(group => group.Id == groupId, ct);

    private async Task<CalendarViewer?> ViewerOfAsync(int accountId, CancellationToken ct)
    {
        if (await _authorizer.ActivePersonIdAsync(accountId, ct) is not { } personId)
            return null;

        return new CalendarViewer(personId, await RightsOfAsync(accountId, ct));
    }

    private async Task<CalendarRights> RightsOfAsync(int accountId, CancellationToken ct) =>
        new(
            HoldsClubRead: await _authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.ClubRead,
                ct
            ),
            ManagesClubCalendar: await _authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.CalendarManageClub,
                ct
            )
        );

    private Expression<Func<CalendarEntry, bool>> VisibleTo(
        int? personId,
        CalendarRights rights,
        DateOnly today
    )
    {
        var tiedGroupIds = _dbContext.TiedGroupIds(personId, today);
        var administeredGroupIds = _dbContext.AdministeredGroupIds(personId, today);
        var castGroupIds = _dbContext.CastGroupIds(personId, today);
        var holdsClubRead = rights.HoldsClubRead;
        var managesClubCalendar = rights.ManagesClubCalendar;

        return entry =>
            entry.Audience == CalendarEntryAudience.People
                ? entry.AudiencePeople.Any(link => link.PersonId == personId)
                    || (
                        entry.OwnerGroupId == null
                            ? managesClubCalendar
                            : administeredGroupIds.Contains(entry.OwnerGroupId.Value)
                    )
                : holdsClubRead
                    || (
                        entry.OwnerGroupId != null
                        && tiedGroupIds.Contains(entry.OwnerGroupId.Value)
                    )
                    || entry.ParticipatingGroups.Any(link => tiedGroupIds.Contains(link.GroupId))
                    || entry.AudienceGroups.Any(link => tiedGroupIds.Contains(link.GroupId))
                    || (
                        entry.Kind == CastAttendance.Kind
                        && entry.AsksForResponse
                        && (
                            (
                                entry.OwnerGroupId != null
                                && castGroupIds.Contains(entry.OwnerGroupId.Value)
                            )
                            || entry.AudienceGroups.Any(link => castGroupIds.Contains(link.GroupId))
                        )
                    );
    }

    private async Task<EntryExtras> ExtrasOfAsync(
        int? personId,
        IReadOnlyList<EntryRow> rows,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var calendarEntryIds = rows.Select(row => row.CalendarEntryId).ToList();

        return new EntryExtras(
            await AnswersOfAsync(personId, calendarEntryIds, ct),
            await _dbContext.PollsOfEntriesAsync(calendarEntryIds, personId, now, ct),
            await _dbContext.SignUpListsOfEntriesAsync(calendarEntryIds, personId, now, ct)
        );
    }

    private async Task<IReadOnlyDictionary<int, AttendanceAnswer>> AnswersOfAsync(
        int? personId,
        IReadOnlyList<int> calendarEntryIds,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return NoAnswers;

        return await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                response.PersonId == personId && calendarEntryIds.Contains(response.CalendarEntryId)
            )
            .ToDictionaryAsync(
                response => response.CalendarEntryId,
                response => response.Answer,
                ct
            );
    }

    private sealed record EntryRow(
        int CalendarEntryId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        CalendarEntryKind Kind,
        int? VenueId,
        string? VenueName,
        int? OwnerGroupId,
        string? OwnerGroupName,
        GroupTone? OwnerGroupTone,
        IReadOnlyList<GroupRow> ParticipatingGroups,
        AudienceNamesRow Audience,
        bool AsksForResponse,
        AddOnPositionsRow AddOnPositions,
        int ResponseCount,
        string? Description,
        bool IsRunning,
        EventFactsRow? Event
    );

    private sealed record EventFactsRow(
        TimeOnly? DoorsOpenAt,
        string Teaser,
        string? AgeHint,
        int? PriceCents,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt,
        int? PictureId,
        DateTimeOffset? PictureRenderedAt
    );

    private sealed record GroupRow(int GroupId, string Name, GroupTone? Tone);

    private sealed record EntryExtras(
        IReadOnlyDictionary<int, AttendanceAnswer> Answers,
        IReadOnlyDictionary<int, IReadOnlyList<PlacedPoll>> Polls,
        IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>> SignUpLists
    )
    {
        public static readonly EntryExtras Nothing = new(
            new Dictionary<int, AttendanceAnswer>(),
            new Dictionary<int, IReadOnlyList<PlacedPoll>>(),
            new Dictionary<int, IReadOnlyList<PlacedSignUpList>>()
        );
    }

    private sealed record AddOnPositionsRow(int? Attendance, int? ParticipatingGroups);

    private sealed record PersonRow(int PersonId, string FirstName, string LastName);

    private sealed record AudienceNamesRow(
        CalendarEntryAudience Audience,
        IReadOnlyList<GroupRow> Groups,
        IReadOnlyList<PersonRow> People
    );

    private readonly record struct CalendarViewer(int PersonId, CalendarRights Rights);

    private sealed record GroupStateRow(int GroupId, DateOnly? ArchivedOn);

    private sealed record VenueStateRow(int VenueId, DateOnly? ArchivedOn);

    private sealed record AudienceHeld(IReadOnlyList<int> GroupIds, IReadOnlyList<int> PersonIds)
    {
        public static readonly AudienceHeld Nothing = new([], []);
    }

    private readonly record struct Placement(
        int? OwnerGroupId,
        int? VenueId,
        IReadOnlyList<int> ParticipatingGroupIds,
        AudienceChoice Audience
    );
}
