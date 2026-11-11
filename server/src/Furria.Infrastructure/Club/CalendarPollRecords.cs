using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class CalendarPollRecords
{
    private const string UnknownPollMessage = "Diese Umfrage gibt es nicht.";
    private const string UnknownOptionMessage = "Diese Antwort gibt es nicht.";
    private const string VotedOptionMessage =
        "Eine Antwort mit Stimmen kann nicht mehr geändert oder entfernt werden.";
    private const string AnonymityKeptMessage = "Eine anonyme Umfrage mit Stimmen bleibt anonym.";
    private const string MultipleChoicesKeptMessage =
        "Solange jemand mehrere Antworten gewählt hat, bleibt die Mehrfachauswahl.";
    private const string ClosedPollEditMessage =
        "Eine beendete Umfrage kann nicht mehr geändert werden.";
    private const string VotedQuestionMessage =
        "Die Frage einer Umfrage mit Stimmen kann nicht mehr geändert werden.";

    private static readonly IReadOnlyDictionary<int, IReadOnlyList<PlacedPoll>> NoPolls =
        new Dictionary<int, IReadOnlyList<PlacedPoll>>();

    internal static async Task<string?> ReconcilePollsAsync(
        this AppDbContext dbContext,
        CalendarEntry entry,
        IReadOnlyList<CalendarEntryAddOnInput> addOns,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var wanted = WantedPollsOf(addOns);
        var heldVotes = await dbContext.VotesOfAsync(entry, ct);

        foreach (var poll in entry.Polls)
            poll.ClosedAt ??= CalendarAddOnClosing.StampOf(poll.VotesUntil, entry.StartsAt, now);

        if (EditRefusalOf(entry.Polls, wanted, heldVotes) is { } refusal)
            return refusal;

        foreach (var dropped in entry.Polls.Where(poll => !IsKept(poll, wanted)).ToList())
            entry.Polls.Remove(dropped);

        foreach (var placed in wanted)
            Apply(PollFor(entry, placed.Poll.PollId), placed);

        return null;
    }

    internal static async Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedPoll>>
    > PollsOfEntriesAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> calendarEntryIds,
        int? viewerPersonId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return NoPolls;

        var polls = await dbContext
            .CalendarPolls.AsNoTracking()
            .Where(poll => calendarEntryIds.Contains(poll.CalendarEntryId))
            .Select(poll => new PollRow(
                poll.Id,
                poll.CalendarEntryId,
                poll.Position,
                poll.Question,
                poll.AllowsMultipleChoices,
                poll.IsAnonymous,
                poll.VotesUntil,
                poll.ClosedAt,
                poll.ClosedBy == null ? null : poll.ClosedBy.FirstName,
                poll.ClosedBy == null ? null : poll.ClosedBy.LastName,
                poll.CalendarEntry!.StartsAt,
                poll.LastRemindedAt,
                poll.Options.OrderBy(option => option.Position)
                    .Select(option => new OptionRow(option.Id, option.Label))
                    .ToList()
            ))
            .ToListAsync(ct);

        if (polls.Count == 0)
            return NoPolls;

        var pollIds = polls.Select(poll => poll.PollId).ToList();
        var votes = await dbContext
            .CalendarPollVotes.AsNoTracking()
            .Where(vote => pollIds.Contains(vote.PollId))
            .OrderBy(vote => EF.Functions.Collate(vote.Person!.FirstName, GermanCollation.Name))
            .ThenBy(vote => EF.Functions.Collate(vote.Person!.LastName, GermanCollation.Name))
            .ThenBy(vote => vote.PersonId)
            .Select(vote => new VoterRow(
                vote.PollId,
                vote.PollOptionId,
                vote.PersonId,
                vote.PollOption!.Poll!.IsAnonymous ? "" : vote.Person!.FirstName,
                vote.PollOption!.Poll!.IsAnonymous ? "" : vote.Person!.LastName
            ))
            .ToListAsync(ct);
        var votesByPoll = votes.ToLookup(vote => vote.PollId);

        return polls
            .GroupBy(poll => poll.CalendarEntryId)
            .ToDictionary(
                group => group.Key,
                group =>
                    (IReadOnlyList<PlacedPoll>)
                        [
                            .. group.Select(poll => new PlacedPoll(
                                poll.Position,
                                ToDetails(poll, [.. votesByPoll[poll.PollId]], viewerPersonId, now),
                                VoterIdsOf(votesByPoll[poll.PollId]),
                                poll.LastRemindedAt
                            )),
                        ]
            );
    }

    [Pure]
    private static IReadOnlySet<int> VoterIdsOf(IEnumerable<VoterRow> votes) =>
        votes.Select(vote => vote.PersonId).ToHashSet();

    [Pure]
    private static CalendarPollDetails ToDetails(
        PollRow poll,
        IReadOnlyList<VoterRow> votes,
        int? viewerPersonId,
        DateTimeOffset now
    ) =>
        new()
        {
            PollId = poll.PollId,
            Question = poll.Question,
            AllowsMultipleChoices = poll.AllowsMultipleChoices,
            IsAnonymous = poll.IsAnonymous,
            VotesUntil = poll.VotesUntil,
            ClosedAt = poll.ClosedAt,
            ClosedBy = CalendarClosers.Of(poll.ClosedByFirstName, poll.ClosedByLastName),
            IsClosed = CalendarAddOnClosing.IsClosed(
                poll.ClosedAt,
                poll.VotesUntil,
                poll.EntryStartsAt,
                now
            ),
            VoterCount = votes.Select(vote => vote.PersonId).Distinct().Count(),
            Options =
            [
                .. poll.Options.Select(option =>
                    ToOptionDetails(
                        option,
                        [.. votes.Where(vote => vote.OptionId == option.OptionId)],
                        poll.IsAnonymous,
                        viewerPersonId
                    )
                ),
            ],
        };

    [Pure]
    private static CalendarPollOptionDetails ToOptionDetails(
        OptionRow option,
        IReadOnlyList<VoterRow> votes,
        bool isAnonymous,
        int? viewerPersonId
    ) =>
        new()
        {
            OptionId = option.OptionId,
            Label = option.Label,
            VoteCount = votes.Count,
            ViewerChose = votes.Any(vote => vote.PersonId == viewerPersonId),
            Voters = isAnonymous ? [] : [.. votes.Select(ToVoter)],
        };

    [Pure]
    private static CalendarPollVoter ToVoter(VoterRow vote) =>
        new()
        {
            PersonId = vote.PersonId,
            FirstName = vote.FirstName,
            LastName = vote.LastName,
        };

    [Pure]
    private static IReadOnlyList<WantedPoll> WantedPollsOf(
        IReadOnlyList<CalendarEntryAddOnInput> addOns
    ) =>
        [
            .. addOns.SelectMany(
                (addOn, position) =>
                    addOn.Poll is { } poll
                        ? [new WantedPoll(position, poll)]
                        : Array.Empty<WantedPoll>()
            ),
        ];

    [Pure]
    private static bool IsKept(CalendarPoll held, IReadOnlyList<WantedPoll> wanted) =>
        wanted.Any(placed => placed.Poll.PollId == held.Id);

    [Pure]
    private static string? EditRefusalOf(
        ICollection<CalendarPoll> held,
        IReadOnlyList<WantedPoll> wanted,
        IReadOnlyList<HeldVote> heldVotes
    )
    {
        foreach (var placed in wanted)
        {
            if (placed.Poll.PollId is not { } pollId)
            {
                if (OptionIdsOf(placed.Poll).Any())
                    return UnknownOptionMessage;

                continue;
            }

            if (held.FirstOrDefault(poll => poll.Id == pollId) is not { } poll)
                return UnknownPollMessage;

            var refusal = EditRefusalOf(
                poll,
                placed.Poll,
                [.. heldVotes.Where(vote => vote.PollId == pollId)]
            );

            if (refusal is not null)
                return refusal;
        }

        return null;
    }

    [Pure]
    private static string? EditRefusalOf(
        CalendarPoll held,
        CalendarPollInput wanted,
        IReadOnlyList<HeldVote> votes
    )
    {
        if (held.ClosedAt is not null && !IsUnchanged(held, wanted))
            return ClosedPollEditMessage;

        if (votes.Count > 0 && held.Question != wanted.Question.Trim())
            return VotedQuestionMessage;

        var heldOptionIds = held.Options.Select(option => option.Id).ToHashSet();
        var wantedLabels = wanted
            .Options.SelectMany(option =>
                option.OptionId is { } optionId
                    ? [(OptionId: optionId, Label: option.Label.Trim())]
                    : Array.Empty<(int OptionId, string Label)>()
            )
            .ToDictionary(option => option.OptionId, option => option.Label);

        if (!wantedLabels.Keys.All(heldOptionIds.Contains))
            return UnknownOptionMessage;

        if (held.Options.Any(option => IsVotedAndTouched(option, wantedLabels, votes)))
            return VotedOptionMessage;

        if (held.IsAnonymous && !wanted.IsAnonymous && votes.Count > 0)
            return AnonymityKeptMessage;

        return held.AllowsMultipleChoices && !wanted.AllowsMultipleChoices && HoldsSeveral(votes)
            ? MultipleChoicesKeptMessage
            : null;
    }

    [Pure]
    private static bool IsUnchanged(CalendarPoll held, CalendarPollInput wanted) =>
        held.Question == wanted.Question.Trim()
        && held.AllowsMultipleChoices == wanted.AllowsMultipleChoices
        && held.IsAnonymous == wanted.IsAnonymous
        && held.VotesUntil == wanted.VotesUntil
        && held.Options.OrderBy(option => option.Position)
            .Select(option => (OptionId: (int?)option.Id, option.Label))
            .SequenceEqual(
                wanted.Options.Select(option => (option.OptionId, Label: option.Label.Trim()))
            );

    [Pure]
    private static bool IsVotedAndTouched(
        CalendarPollOption option,
        IReadOnlyDictionary<int, string> wantedLabels,
        IReadOnlyList<HeldVote> votes
    ) =>
        votes.Any(vote => vote.OptionId == option.Id)
        && (!wantedLabels.TryGetValue(option.Id, out var label) || label != option.Label);

    [Pure]
    private static bool HoldsSeveral(IReadOnlyList<HeldVote> votes) =>
        votes.GroupBy(vote => vote.PersonId).Any(person => person.Count() > 1);

    [Pure]
    private static IEnumerable<int> OptionIdsOf(CalendarPollInput poll) =>
        poll.Options.Select(option => option.OptionId).OfType<int>();

    private static CalendarPoll PollFor(CalendarEntry entry, int? pollId)
    {
        if (pollId is { } heldId)
            return entry.Polls.Single(poll => poll.Id == heldId);

        var poll = new CalendarPoll();
        entry.Polls.Add(poll);
        return poll;
    }

    private static void Apply(CalendarPoll poll, WantedPoll placed)
    {
        var wanted = placed.Poll;

        poll.Position = placed.Position;
        poll.Question = wanted.Question.Trim();
        poll.AllowsMultipleChoices = wanted.AllowsMultipleChoices;
        poll.IsAnonymous = wanted.IsAnonymous;
        poll.VotesUntil = wanted.VotesUntil;

        var keptOptionIds = OptionIdsOf(wanted).ToHashSet();

        foreach (var dropped in poll.Options.Where(o => !keptOptionIds.Contains(o.Id)).ToList())
            poll.Options.Remove(dropped);

        foreach (var (option, position) in wanted.Options.Select((option, i) => (option, i)))
            ApplyOption(OptionFor(poll, option.OptionId), option, position);
    }

    private static CalendarPollOption OptionFor(CalendarPoll poll, int? optionId)
    {
        if (optionId is { } heldId)
            return poll.Options.Single(option => option.Id == heldId);

        var option = new CalendarPollOption();
        poll.Options.Add(option);
        return option;
    }

    private static void ApplyOption(
        CalendarPollOption option,
        CalendarPollOptionInput wanted,
        int position
    )
    {
        option.Position = position;
        option.Label = wanted.Label.Trim();
    }

    private static async Task<IReadOnlyList<HeldVote>> VotesOfAsync(
        this AppDbContext dbContext,
        CalendarEntry entry,
        CancellationToken ct
    )
    {
        var pollIds = entry.Polls.Select(poll => poll.Id).ToList();

        if (pollIds.Count == 0)
            return [];

        return await dbContext
            .CalendarPollVotes.AsNoTracking()
            .Where(vote => pollIds.Contains(vote.PollId))
            .Select(vote => new HeldVote(vote.PollId, vote.PollOptionId, vote.PersonId))
            .ToListAsync(ct);
    }

    private sealed record WantedPoll(int Position, CalendarPollInput Poll);

    private sealed record HeldVote(int PollId, int OptionId, int PersonId);

    private sealed record PollRow(
        int PollId,
        int CalendarEntryId,
        int Position,
        string Question,
        bool AllowsMultipleChoices,
        bool IsAnonymous,
        DateTimeOffset? VotesUntil,
        DateTimeOffset? ClosedAt,
        string? ClosedByFirstName,
        string? ClosedByLastName,
        DateTimeOffset EntryStartsAt,
        DateTimeOffset? LastRemindedAt,
        IReadOnlyList<OptionRow> Options
    );

    private sealed record OptionRow(int OptionId, string Label);

    private sealed record VoterRow(
        int PollId,
        int OptionId,
        int PersonId,
        string FirstName,
        string LastName
    );
}

internal sealed record PlacedPoll(
    int Position,
    CalendarPollDetails Details,
    IReadOnlySet<int> VoterIds,
    DateTimeOffset? LastRemindedAt
);
