using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupAdminExpectations
{
    private readonly Expected _expected;
    private readonly int _groupAdminId;

    internal GroupAdminExpectations(Expected expected, int groupAdminId)
    {
        _expected = expected;
        _groupAdminId = groupAdminId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .GroupAdmins.AsNoTracking()
                        .AnyAsync(row => row.Id == _groupAdminId, ct),
                    $"Expected no GroupAdmin with id {_groupAdminId}."
                )
        );

    public Expected ToHaveFunction(string? function) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(function, (await SingleAsync(dbContext, ct)).Function)
        );

    public Expected ToHavePeriod(DateOnly sinceOn, DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var admin = await SingleAsync(dbContext, ct);
                Assert.Equal(sinceOn, admin.SinceOn);
                Assert.Equal(untilOn, admin.UntilOn);
            }
        );

    private Task<GroupAdmin> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.GroupAdmins.AsNoTracking().SingleAsync(row => row.Id == _groupAdminId, ct);
}
