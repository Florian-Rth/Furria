using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActGlanceReader
{
    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly EveningStageTimes _stageTimes;

    public ActGlanceReader(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        EveningStageTimes stageTimes
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _stageTimes = stageTimes;
    }

    public async Task<IReadOnlyList<MyActSummary>> GlancesOfAsync(
        IReadOnlyList<ActSummary> acts,
        ActGlanceViewer viewer,
        CancellationToken ct
    )
    {
        var actIds = acts.Select(act => act.ActId).ToList();
        var groupIds = acts.Select(act => act.Group?.GroupId).OfType<int>().Distinct().ToList();
        var from = ClubClock.StartOfDay(viewer.Today);
        var playable = await PlayableActIdsAsync(actIds, ct);
        var editors = await EditorsAsync(actIds, groupIds, viewer.Today, ct);
        var evenings = await NextEveningsAsync(actIds, from, ct);
        var trainings = await NextTrainingsAsync(acts, groupIds, viewer, from, ct);

        return
        [
            .. acts.Select(act => new MyActSummary
            {
                ActId = act.ActId,
                Name = act.Name,
                Kind = act.Kind,
                SessionYear = viewer.SessionYear,
                Group = act.Group,
                ViewerInCast = act.Cast.Any(member => member.PersonId == viewer.PersonId),
                ViewerLeads = act.Group is { } group && viewer.LedGroupIds.Contains(group.GroupId),
                IsPlayable = playable.Contains(act.ActId),
                Cast = act.Cast,
                Editors = editors.EditorsOf(act),
                NextEvening = evenings.GetValueOrDefault(act.ActId),
                NextTraining = trainings.GetValueOrDefault(act.ActId),
            }),
        ];
    }

    private async Task<HashSet<int>> PlayableActIdsAsync(List<int> actIds, CancellationToken ct)
    {
        var withSongs = await _dbContext
            .ActSongs.Where(song => actIds.Contains(song.ActId))
            .Select(song => song.ActId)
            .Distinct()
            .ToListAsync(ct);
        var withAdoptedTrack = await _dbContext
            .ActFinalTracks.Where(track => actIds.Contains(track.ActId) && track.AdoptedAt != null)
            .Select(track => track.ActId)
            .Distinct()
            .ToListAsync(ct);

        return [.. withSongs, .. withAdoptedTrack];
    }

    private async Task<ActEditors> EditorsAsync(
        List<int> actIds,
        List<int> groupIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var leads = await _dbContext
            .GroupAdmins.AsNoTracking()
            .Where(Conferring.GroupAdmins(today))
            .Where(admin => groupIds.Contains(admin.GroupId))
            .Select(admin => new { admin.GroupId, admin.PersonId })
            .ToListAsync(ct);
        var coEditors = await _dbContext
            .ActCoEditors.AsNoTracking()
            .Where(editor => actIds.Contains(editor.ActId))
            .Select(editor => new { editor.ActId, editor.PersonId })
            .ToListAsync(ct);
        var persons = await _catalogue.PersonsInNameOrderAsync(
            [
                .. leads
                    .Select(lead => lead.PersonId)
                    .Concat(coEditors.Select(editor => editor.PersonId))
                    .Distinct(),
            ],
            ct
        );

        return new ActEditors(
            persons,
            leads.ToLookup(lead => lead.GroupId, lead => lead.PersonId),
            coEditors.ToLookup(editor => editor.ActId, editor => editor.PersonId)
        );
    }

    private async Task<Dictionary<int, MyActEveningSummary>> NextEveningsAsync(
        List<int> actIds,
        DateTimeOffset from,
        CancellationToken ct
    )
    {
        var coming = await _dbContext
            .Appearances.AsNoTracking()
            .Where(appearance =>
                actIds.Contains(appearance.ActId)
                && appearance.CalendarEntry!.StartsAt >= from
                && appearance.CalendarEntry.Event!.CancelledAt == null
            )
            .Select(appearance => new EveningRow(
                appearance.ActId,
                appearance.CalendarEntryId,
                appearance.CalendarEntry!.Title,
                appearance.CalendarEntry.StartsAt,
                appearance.Position
            ))
            .ToListAsync(ct);
        var next = NextPerAct(coming, row => row.ActId, row => row.StartsAt, row => row.EventId);
        var stageStarts = await _stageTimes.StartsOfAsync(
            [.. next.Where(row => row.Position is not null).Select(row => row.EventId).Distinct()],
            ct
        );

        return next.ToDictionary(row => row.ActId, row => EveningOf(row, stageStarts));
    }

    private async Task<Dictionary<int, MyActTrainingSummary>> NextTrainingsAsync(
        IReadOnlyList<ActSummary> acts,
        List<int> groupIds,
        ActGlanceViewer viewer,
        DateTimeOffset from,
        CancellationToken ct
    )
    {
        var kinds = CastAttendance.Kinds;
        var entries = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry =>
                kinds.Contains(entry.Kind)
                && entry.StartsAt >= from
                && (
                    (entry.OwnerGroupId != null && groupIds.Contains(entry.OwnerGroupId.Value))
                    || entry.ParticipatingGroups.Any(participant =>
                        groupIds.Contains(participant.GroupId)
                    )
                )
            )
            .Select(entry => new TrainingRow(
                entry.Id,
                entry.Title,
                entry.StartsAt,
                entry.OwnerGroupId,
                entry.ParticipatingGroups.Select(participant => participant.GroupId).ToList()
            ))
            .ToListAsync(ct);
        var nextByAct = acts.Where(ActStudioGate.IsEditable)
            .SelectMany(act =>
                NextTrainingOf(act, entries, viewer.SessionYear) is { } training
                    ? new[] { (act, training) }
                    : []
            )
            .ToDictionary(pair => pair.act, pair => pair.training);
        var answers = await AnswersAsync(nextByAct, ct);

        return nextByAct.ToDictionary(
            pair => pair.Key.ActId,
            pair => TrainingOf(pair.Value, pair.Key, answers, viewer.PersonId)
        );
    }

    private async Task<ILookup<int, AnswerRow>> AnswersAsync(
        Dictionary<ActSummary, TrainingRow> nextByAct,
        CancellationToken ct
    )
    {
        var entryIds = nextByAct.Values.Select(training => training.Id).Distinct().ToList();
        var personIds = nextByAct
            .Keys.SelectMany(act => act.Cast.Select(member => member.PersonId))
            .Distinct()
            .ToList();
        var answers = await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                entryIds.Contains(response.CalendarEntryId) && personIds.Contains(response.PersonId)
            )
            .Select(response => new AnswerRow(
                response.CalendarEntryId,
                response.PersonId,
                response.Answer
            ))
            .ToListAsync(ct);

        return answers.ToLookup(answer => answer.CalendarEntryId);
    }

    [Pure]
    private static IReadOnlyList<T> NextPerAct<T>(
        IEnumerable<T> rows,
        Func<T, int> actOf,
        Func<T, DateTimeOffset> startsAtOf,
        Func<T, int> idOf
    ) =>
        [
            .. rows.GroupBy(actOf)
                .Select(rowsOfAct => rowsOfAct.OrderBy(startsAtOf).ThenBy(idOf).First()),
        ];

    [Pure]
    private static MyActEveningSummary EveningOf(
        EveningRow row,
        IReadOnlyDictionary<StagedAct, DateTimeOffset> stageStarts
    ) =>
        new()
        {
            EventId = row.EventId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            Position = row.Position,
            StageStartsAt = stageStarts.TryGetValue(
                new StagedAct(row.EventId, row.ActId),
                out var stageStartsAt
            )
                ? stageStartsAt
                : null,
        };

    [Pure]
    private static TrainingRow? NextTrainingOf(
        ActSummary act,
        IReadOnlyList<TrainingRow> entries,
        int sessionYear
    ) =>
        act.Group is { } group
            ? entries
                .Where(entry =>
                    (
                        entry.OwnerGroupId == group.GroupId
                        || entry.ParticipantIds.Contains(group.GroupId)
                    )
                    && CastAttendance.SessionYearOf(entry.StartsAt) == sessionYear
                )
                .OrderBy(entry => entry.StartsAt)
                .ThenBy(entry => entry.Id)
                .FirstOrDefault()
            : null;

    [Pure]
    private static MyActTrainingSummary TrainingOf(
        TrainingRow training,
        ActSummary act,
        ILookup<int, AnswerRow> answers,
        int viewerId
    )
    {
        var castIds = act.Cast.Select(member => member.PersonId).ToHashSet();
        var castAnswers = answers[training.Id].Where(answer => castIds.Contains(answer.PersonId));

        return new MyActTrainingSummary
        {
            CalendarEntryId = training.Id,
            Title = training.Title,
            StartsAt = training.StartsAt,
            ViewerAnswer = castAnswers
                .FirstOrDefault(answer => answer.PersonId == viewerId)
                ?.Answer,
            Present = castAnswers.Count(answer => answer.Answer == AttendanceAnswer.Yes),
            Absent = castAnswers.Count(answer => answer.Answer == AttendanceAnswer.No),
        };
    }

    private sealed record EveningRow(
        int ActId,
        int EventId,
        string Title,
        DateTimeOffset StartsAt,
        int? Position
    );

    private sealed record TrainingRow(
        int Id,
        string Title,
        DateTimeOffset StartsAt,
        int? OwnerGroupId,
        List<int> ParticipantIds
    );

    private sealed record AnswerRow(int CalendarEntryId, int PersonId, AttendanceAnswer Answer);

    private sealed class ActEditors
    {
        private readonly IReadOnlyList<CastMember> _persons;
        private readonly ILookup<int, int> _leadsByGroup;
        private readonly ILookup<int, int> _coEditorsByAct;

        public ActEditors(
            IReadOnlyList<CastMember> persons,
            ILookup<int, int> leadsByGroup,
            ILookup<int, int> coEditorsByAct
        )
        {
            _persons = persons;
            _leadsByGroup = leadsByGroup;
            _coEditorsByAct = coEditorsByAct;
        }

        public IReadOnlyList<CastMember> EditorsOf(ActSummary act)
        {
            var ids = _coEditorsByAct[act.ActId]
                .Concat(act.Group is { } group ? _leadsByGroup[group.GroupId] : [])
                .ToHashSet();

            return [.. _persons.Where(person => ids.Contains(person.PersonId))];
        }
    }
}
