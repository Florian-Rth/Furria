using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PollExpectations
{
    private readonly Expected _expected;
    private readonly int _pollId;

    internal PollExpectations(Expected expected, int pollId)
    {
        _expected = expected;
        _pollId = pollId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext.Polls.AsNoTracking().AnyAsync(row => row.Id == _pollId, ct),
                    $"Expected no Poll with id {_pollId}."
                )
        );

    public Expected ToHaveOptions(params string[] labels) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    labels,
                    await dbContext
                        .PollOptions.AsNoTracking()
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
                            .PollVotes.AsNoTracking()
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
                    await dbContext.PollVotes.CountAsync(vote => vote.PollId == _pollId, ct)
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

    public Expected ToBeClosedAt(DateTimeOffset closedAt, int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var poll = await SingleAsync(dbContext, ct);
                Assert.Equal(closedAt, poll.ClosedAt);
                Assert.Equal(personId, poll.ClosedByPersonId);
            }
        );

    public Expected ToBeClosedBy(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var poll = await SingleAsync(dbContext, ct);
                Assert.NotNull(poll.ClosedAt);
                Assert.Equal(personId, poll.ClosedByPersonId);
            }
        );

    public Expected ToHaveVotesUntil(DateTimeOffset? votesUntil) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(votesUntil, (await SingleAsync(dbContext, ct)).VotesUntil)
        );

    public Expected ToHaveQuestion(string question) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(question, (await SingleAsync(dbContext, ct)).Question)
        );

    private Task<Poll> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Polls.AsNoTracking().SingleAsync(row => row.Id == _pollId, ct);
}
