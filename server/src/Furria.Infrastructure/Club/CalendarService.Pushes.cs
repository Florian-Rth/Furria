using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private async Task EnqueueCreatePushesAsync(
        CalendarEntry entry,
        int? actorPersonId,
        CancellationToken ct
    )
    {
        var venueName = await VenueNameAsync(entry.VenueId, ct);

        if (entry.AsksForResponse)
            EnqueuePush(CalendarPushReason.AsksForResponse, entry, [], actorPersonId, venueName);
        else if (entry.Audience == CalendarEntryAudience.People)
            EnqueuePush(
                CalendarPushReason.Chosen,
                entry,
                ChosenOf(entry),
                actorPersonId,
                venueName
            );
    }

    private async Task<PushBaseline> PushBaselineOfAsync(
        CalendarEntry entry,
        CalendarEntrySlot slotAfter,
        CancellationToken ct
    )
    {
        var moves = CalendarPushRules.Moves(SlotOf(entry), slotAfter);

        return new(
            moves,
            entry.Audience,
            ChosenOf(entry),
            moves ? await AnsweredYesOrMaybeAsync(entry.Id, ct) : []
        );
    }

    private async Task EnqueueUpdatePushesAsync(
        CalendarEntry entry,
        PushBaseline before,
        int? actorPersonId,
        CancellationToken ct
    )
    {
        var newlyChosen = CalendarPushRules.NewlyChosen(
            before.Audience,
            before.Chosen,
            entry.Audience,
            ChosenOf(entry)
        );
        IReadOnlyList<int> moved = [.. before.AnsweredYesOrMaybe.Except(newlyChosen)];
        if (newlyChosen.Count == 0 && moved.Count == 0)
            return;

        var venueName = await VenueNameAsync(entry.VenueId, ct);
        EnqueuePush(CalendarPushReason.Chosen, entry, newlyChosen, actorPersonId, venueName);
        if (before.Moves)
            EnqueuePush(CalendarPushReason.Moved, entry, moved, actorPersonId, venueName);
    }

    private async Task EnqueueDeletePushAsync(
        CalendarEntry entry,
        int? actorPersonId,
        CancellationToken ct
    )
    {
        var answered = await AnsweredYesOrMaybeAsync(entry.Id, ct);
        if (answered.Count == 0)
            return;

        EnqueuePush(
            CalendarPushReason.Deleted,
            entry,
            answered,
            actorPersonId,
            await VenueNameAsync(entry.VenueId, ct)
        );
    }

    private void EnqueuePush(
        CalendarPushReason reason,
        CalendarEntry entry,
        IReadOnlyList<int> personIds,
        int? actorPersonId,
        string? venueName
    )
    {
        if (reason != CalendarPushReason.AsksForResponse && personIds.Count == 0)
            return;

        _dbContext.OutboxCalendarPushes.Add(
            PushOf(reason, entry, personIds, actorPersonId, venueName)
        );
    }

    [Pure]
    private static OutboxCalendarPush PushOf(
        CalendarPushReason reason,
        CalendarEntry entry,
        IReadOnlyList<int> personIds,
        int? actorPersonId,
        string? venueName
    ) =>
        new()
        {
            Reason = reason,
            CalendarEntryId = entry.Id,
            ActorPersonId = actorPersonId,
            PersonIds = [.. personIds],
            Title = entry.Title,
            StartsAt = entry.StartsAt,
            EndsAt = entry.EndsAt,
            VenueName = venueName,
            Kind = entry.Kind,
            AsksForResponse = entry.AsksForResponse,
            OwnerGroupId = entry.OwnerGroupId,
            ParticipatingGroupIds = [.. entry.ParticipatingGroups.Select(link => link.GroupId)],
            Audience = entry.Audience,
            AudienceGroupIds = [.. entry.AudienceGroups.Select(link => link.GroupId)],
            AudiencePersonIds = [.. ChosenOf(entry)],
        };

    private async Task<string?> VenueNameAsync(int? venueId, CancellationToken ct) =>
        venueId is { } id
            ? await _dbContext
                .Venues.AsNoTracking()
                .Where(venue => venue.Id == id)
                .Select(venue => venue.Name)
                .SingleOrDefaultAsync(ct)
            : null;

    private Task<List<int>> AnsweredYesOrMaybeAsync(int calendarEntryId, CancellationToken ct) =>
        _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response => response.CalendarEntryId == calendarEntryId)
            .Where(response =>
                response.Answer == AttendanceAnswer.Yes || response.Answer == AttendanceAnswer.Maybe
            )
            .OrderBy(response => response.PersonId)
            .Select(response => response.PersonId)
            .ToListAsync(ct);

    [Pure]
    private static CalendarEntrySlot SlotOf(CalendarEntry entry) =>
        new(entry.StartsAt, entry.EndsAt, entry.VenueId);

    [Pure]
    private static IReadOnlyList<int> ChosenOf(CalendarEntry entry) =>
        [.. entry.AudiencePeople.Select(link => link.PersonId)];

    private sealed record PushBaseline(
        bool Moves,
        CalendarEntryAudience Audience,
        IReadOnlyList<int> Chosen,
        IReadOnlyList<int> AnsweredYesOrMaybe
    );
}
