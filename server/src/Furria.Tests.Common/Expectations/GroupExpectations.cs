using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal GroupExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToHaveDescription(string description) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(description, (await SingleAsync(dbContext, ct)).Description)
        );

    public Expected ToBeRecruiting(bool isRecruiting) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(isRecruiting, (await SingleAsync(dbContext, ct)).IsRecruiting)
        );

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    public Expected ToHaveBeenCreatedAt(DateTimeOffset createdAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(createdAt, (await SingleAsync(dbContext, ct)).CreatedAt)
        );

    public Expected ToHaveBeenTouchedAt(DateTimeOffset updatedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(updatedAt, (await SingleAsync(dbContext, ct)).UpdatedAt)
        );

    private Task<Group> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Groups.AsNoTracking().SingleAsync(row => row.Id == _groupId, ct);
}
