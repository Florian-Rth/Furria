using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class CalendarPollExpectations
{
    private readonly Expected _expected;
    private readonly int _pollId;

    internal CalendarPollExpectations(Expected expected, int pollId)
    {
        _expected = expected;
        _pollId = pollId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .CalendarPolls.AsNoTracking()
                        .AnyAsync(row => row.Id == _pollId, ct),
                    $"Expected no CalendarPoll with id {_pollId}."
                )
        );

    public Expected ToHaveOptions(params string[] labels) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    labels,
                    await dbContext
                        .CalendarPollOptions.AsNoTracking()
                        .Where(option => option.PollId == _pollId)
                        .OrderBy(option => option.Position)
                        .Select(option => option.Label)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveVotesOf(int personId, params string[] labels) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    labels.Order(StringComparer.Ordinal),
                    (
                        await dbContext
                            .CalendarPollVotes.AsNoTracking()
                            .Where(vote => vote.PollId == _pollId && vote.PersonId == personId)
                            .Select(vote => vote.PollOption!.Label)
                            .ToListAsync(ct)
                    ).Order(StringComparer.Ordinal)
                )
        );

    public Expected ToHaveVoteCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext.CalendarPollVotes.CountAsync(vote => vote.PollId == _pollId, ct)
                )
        );

    public Expected ToBeAnonymous(bool isAnonymous) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(isAnonymous, (await SingleAsync(dbContext, ct)).IsAnonymous)
        );

    public Expected ToBeClosedByHand(bool isClosed) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(isClosed, (await SingleAsync(dbContext, ct)).ClosedAt is not null)
        );

    private Task<CalendarPoll> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.CalendarPolls.AsNoTracking().SingleAsync(row => row.Id == _pollId, ct);
}
