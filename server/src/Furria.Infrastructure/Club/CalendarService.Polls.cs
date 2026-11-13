using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string UnknownPollMessage = "Diese Umfrage gibt es nicht.";
    private const string NotYourPollMessage = "An dieser Umfrage kannst du nicht teilnehmen.";
    private const string ClosedPollMessage = "Diese Umfrage ist beendet.";
    private const string UnknownPollOptionMessage = "Diese Antwort gibt es nicht.";
    private const string SingleChoiceMessage = "Bei dieser Umfrage ist nur eine Antwort möglich.";
    private const string StartedPollMessage =
        "Der Termin hat begonnen. Die Umfrage kann nicht wieder geöffnet werden.";
    private const string ExpiredAnnouncementPollMessage =
        "Der Aushang ist abgelaufen. Die Umfrage kann nicht wieder geöffnet werden.";

    public async Task<Result> CastPollVotesAsync(CastPollVotesCommand command, CancellationToken ct)
    {
        if (await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotYourPollMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockPollAsync(command.PollId, command.Host, ct);

        var host = await PollHostAsync(command.PollId, command.Host, ct);
        var sight = new AddOnSight(
            command.ActorAccountId,
            personId,
            host,
            UnknownPollMessage,
            NotYourPollMessage,
            AddOnAccess.Answer
        );

        if (await AddOnSightRefusalAsync(sight, ct) is { } unseen)
            return unseen;

        if (host is null || await BallotOfAsync(command.PollId, ct) is not { } ballot)
            return Result.NotFound(UnknownPollMessage);

        if (
            BallotRefusalOf(ballot, host.ClosesAt, command.OptionIds, _timeProvider.GetUtcNow()) is
            { } refusal
        )
            return Result.Validation(refusal);

        var held = await _dbContext
            .PollVotes.Where(vote => vote.PollId == command.PollId && vote.PersonId == personId)
            .ToListAsync(ct);

        _dbContext.PollVotes.RemoveRange(
            held.Where(vote => !command.OptionIds.Contains(vote.PollOptionId))
        );
        _dbContext.PollVotes.AddRange(
            command
                .OptionIds.Where(optionId => held.All(vote => vote.PollOptionId != optionId))
                .Select(optionId => new PollVote
                {
                    PollId = command.PollId,
                    PollOptionId = optionId,
                    PersonId = personId,
                })
        );

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> ClosePollAsync(
        int actorAccountId,
        int pollId,
        AddOnHostKind hostKind,
        CancellationToken ct
    )
    {
        var closerPersonId = await _authorizer.ActivePersonIdAsync(actorAccountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockPollAsync(pollId, hostKind, ct);

        var poll = await _dbContext.Polls.SingleOrDefaultAsync(row => row.Id == pollId, ct);

        if (poll is null || await PollHostAsync(pollId, hostKind, ct) is not { } host)
            return Result.NotFound(UnknownPollMessage);

        if (!await MayManageAsync(actorAccountId, host, ct))
            return Result.Forbidden(NotManagedMessageOf(host));

        if (poll.ClosedAt is null)
        {
            var closing = AddOnClosing.CloseOf(
                poll.VotesUntil,
                host.ClosesAt,
                _timeProvider.GetUtcNow(),
                closerPersonId
            );
            poll.ClosedAt = closing.ClosedAt;
            poll.ClosedByPersonId = closing.ClosedByPersonId;
        }

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result> ReopenPollAsync(
        int actorAccountId,
        int pollId,
        AddOnHostKind hostKind,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockPollAsync(pollId, hostKind, ct);

        var poll = await _dbContext.Polls.SingleOrDefaultAsync(row => row.Id == pollId, ct);

        if (poll is null || await PollHostAsync(pollId, hostKind, ct) is not { } host)
            return Result.NotFound(UnknownPollMessage);

        if (!await MayManageAsync(actorAccountId, host, ct))
            return Result.Forbidden(NotManagedMessageOf(host));

        var now = _timeProvider.GetUtcNow();

        if (host.ClosesAt <= now)
            return Result.Validation(ReopenRefusalOf(host));

        Reopen(poll, now);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static string ReopenRefusalOf(AddOnHost host) =>
        host is AnnouncementAddOnHost ? ExpiredAnnouncementPollMessage : StartedPollMessage;

    private static void Reopen(Poll poll, DateTimeOffset now)
    {
        poll.ClosedAt = null;
        poll.ClosedByPersonId = null;

        if (poll.VotesUntil <= now)
            poll.VotesUntil = null;
    }

    [Pure]
    private static string? BallotRefusalOf(
        PollBallot ballot,
        DateTimeOffset? hostClosesAt,
        IReadOnlyList<int> optionIds,
        DateTimeOffset now
    )
    {
        if (AddOnClosing.IsClosed(ballot.ClosedAt, ballot.VotesUntil, hostClosesAt, now))
            return ClosedPollMessage;

        if (!optionIds.All(ballot.OptionIds.Contains))
            return UnknownPollOptionMessage;

        return !ballot.AllowsMultipleChoices && optionIds.Count > 1 ? SingleChoiceMessage : null;
    }

    private async Task LockPollAsync(int pollId, AddOnHostKind hostKind, CancellationToken ct)
    {
        if (hostKind == AddOnHostKind.Announcement)
            await _dbContext.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM announcement JOIN poll ON poll.announcement_id = announcement.id WHERE poll.id = {pollId} FOR SHARE OF announcement",
                ct
            );
        else
            await _dbContext.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM calendar_entry entry JOIN poll ON poll.calendar_entry_id = entry.id WHERE poll.id = {pollId} FOR SHARE OF entry",
                ct
            );

        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM poll WHERE id = {pollId} FOR NO KEY UPDATE",
            ct
        );
    }

    private Task<PollBallot?> BallotOfAsync(int pollId, CancellationToken ct) =>
        _dbContext
            .Polls.AsNoTracking()
            .Where(poll => poll.Id == pollId)
            .Select(poll => new PollBallot(
                poll.AllowsMultipleChoices,
                poll.VotesUntil,
                poll.ClosedAt,
                poll.Options.Select(option => option.Id).ToList()
            ))
            .SingleOrDefaultAsync(ct);

    private sealed record PollBallot(
        bool AllowsMultipleChoices,
        DateTimeOffset? VotesUntil,
        DateTimeOffset? ClosedAt,
        IReadOnlyList<int> OptionIds
    );
}
