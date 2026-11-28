using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class ActExpectations
{
    private readonly Expected _expected;
    private readonly int _actId;

    internal ActExpectations(Expected expected, int actId)
    {
        _expected = expected;
        _actId = actId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToBelongTo(int? groupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(groupId, (await SingleAsync(dbContext, ct)).GroupId)
        );

    public Expected ToBelongToSession(int? sessionYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(sessionYear, (await SingleAsync(dbContext, ct)).SessionYear)
        );

    public Expected ToHaveFrozenCastExactly(params int[] personIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    personIds.Order(),
                    await dbContext
                        .FrozenCastMembers.AsNoTracking()
                        .Where(row => row.ActId == _actId)
                        .OrderBy(row => row.PersonId)
                        .Select(row => row.PersonId)
                        .ToListAsync(ct)
                )
        );

    public Expected ToSeatExactly(params (int SpotId, int? PersonId)[] spots) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    spots.OrderBy(spot => spot.SpotId),
                    (
                        await dbContext
                            .Spots.AsNoTracking()
                            .Where(row => row.ActId == _actId)
                            .OrderBy(row => row.Id)
                            .Select(row => new { row.Id, row.PersonId })
                            .ToListAsync(ct)
                    ).Select(row => (row.Id, row.PersonId))
                )
        );

    public Expected ToBeCoEditedByExactly(params int[] personIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    personIds.Order(),
                    await dbContext
                        .ActCoEditors.AsNoTracking()
                        .Where(row => row.ActId == _actId)
                        .OrderBy(row => row.PersonId)
                        .Select(row => row.PersonId)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveChoreographiesAtVersions(params int[] versions) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    versions.Order(),
                    await dbContext
                        .Choreographies.AsNoTracking()
                        .Where(row => row.ActId == _actId)
                        .OrderBy(row => row.Version)
                        .Select(row => row.Version)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveChoreographyHistoryAtVersions(params int[] versions) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    versions.Order(),
                    await dbContext
                        .ChoreographyVersions.AsNoTracking()
                        .Where(row => row.Choreography!.ActId == _actId)
                        .OrderBy(row => row.Version)
                        .Select(row => row.Version)
                        .ToListAsync(ct)
                )
        );

    public Expected ToBeInUse() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ArchivedAt)
        );

    public Expected ToWishExactly(
        params (RunningOrderRuleKind Kind, RuleStrength Strength)[] wishes
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    wishes.OrderBy(wish => wish.Kind),
                    (
                        await dbContext
                            .ActWishes.AsNoTracking()
                            .Where(row => row.ActId == _actId)
                            .ToListAsync(ct)
                    )
                        .OrderBy(row => row.Kind)
                        .Select(row => (row.Kind, row.Strength))
                )
        );

    private Task<Act> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Acts.AsNoTracking().SingleAsync(row => row.Id == _actId, ct);
}
