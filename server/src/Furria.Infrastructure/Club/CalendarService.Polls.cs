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

    public async Task<Result> CastPollVotesAsync(
        CastCalendarPollVotesCommand command,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotYourPollMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockPollAsync(command.PollId, ct);

        if (
            await AddOnSightRefusalAsync(
                new AddOnSight(
                    command.ActorAccountId,
                    personId,
                    _dbContext
                        .CalendarPolls.Where(poll => poll.Id == command.PollId)
                        .Select(poll => poll.CalendarEntry!),
                    UnknownPollMessage,
                    NotYourPollMessage,
                    AddOnAccess.Answer
                ),
                ct
            ) is
            { } unseen
        )
            return unseen;

        if (await BallotOfAsync(command.PollId, ct) is not { } ballot)
            return Result.NotFound(UnknownPollMessage);

        if (BallotRefusalOf(ballot, command.OptionIds, _timeProvider.GetUtcNow()) is { } refusal)
            return Result.Validation(refusal);

        var held = await _dbContext
            .CalendarPollVotes.Where(vote =>
                vote.PollId == command.PollId && vote.PersonId == personId
            )
            .ToListAsync(ct);

        _dbContext.CalendarPollVotes.RemoveRange(
            held.Where(vote => !command.OptionIds.Contains(vote.PollOptionId))
        );
        _dbContext.CalendarPollVotes.AddRange(
            command
                .OptionIds.Where(optionId => held.All(vote => vote.PollOptionId != optionId))
                .Select(optionId => new CalendarPollVote
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

    public async Task<Result> ClosePollAsync(int actorAccountId, int pollId, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockPollAsync(pollId, ct);

        var ownerGroup = await _dbContext
            .CalendarPolls.AsNoTracking()
            .Where(poll => poll.Id == pollId)
            .Select(poll => new PollOwnerRow(poll.CalendarEntry!.OwnerGroupId))
            .SingleOrDefaultAsync(ct);

        if (ownerGroup is null)
            return Result.NotFound(UnknownPollMessage);

        if (!await MayOwnAsync(actorAccountId, ownerGroup.OwnerGroupId, ct))
            return Result.Forbidden(NotOwnedMessage);

        var poll = await _dbContext.CalendarPolls.SingleOrDefaultAsync(row => row.Id == pollId, ct);

        if (poll is null)
            return Result.NotFound(UnknownPollMessage);

        poll.ClosedAt ??= _timeProvider.GetUtcNow();
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static string? BallotRefusalOf(
        PollBallot ballot,
        IReadOnlyList<int> optionIds,
        DateTimeOffset now
    )
    {
        if (
            CalendarAddOnClosing.IsClosed(
                ballot.ClosedAt,
                ballot.VotesUntil,
                ballot.EntryStartsAt,
                now
            )
        )
            return ClosedPollMessage;

        if (!optionIds.All(ballot.OptionIds.Contains))
            return UnknownPollOptionMessage;

        return !ballot.AllowsMultipleChoices && optionIds.Count > 1 ? SingleChoiceMessage : null;
    }

    private async Task LockPollAsync(int pollId, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM calendar_entry entry JOIN calendar_poll poll ON poll.calendar_entry_id = entry.id WHERE poll.id = {pollId} FOR SHARE OF entry",
            ct
        );
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM calendar_poll WHERE id = {pollId} FOR NO KEY UPDATE",
            ct
        );
    }

    private Task<PollBallot?> BallotOfAsync(int pollId, CancellationToken ct) =>
        _dbContext
            .CalendarPolls.AsNoTracking()
            .Where(poll => poll.Id == pollId)
            .Select(poll => new PollBallot(
                poll.AllowsMultipleChoices,
                poll.VotesUntil,
                poll.ClosedAt,
                poll.CalendarEntry!.StartsAt,
                poll.Options.Select(option => option.Id).ToList()
            ))
            .SingleOrDefaultAsync(ct);

    private sealed record PollOwnerRow(int? OwnerGroupId);

    private sealed record PollBallot(
        bool AllowsMultipleChoices,
        DateTimeOffset? VotesUntil,
        DateTimeOffset? ClosedAt,
        DateTimeOffset EntryStartsAt,
        IReadOnlyList<int> OptionIds
    );
}
