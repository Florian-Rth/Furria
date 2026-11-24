using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BoardOfficeExpectations
{
    private readonly Expected _expected;
    private readonly int _boardOfficeId;

    internal BoardOfficeExpectations(Expected expected, int boardOfficeId)
    {
        _expected = expected;
        _boardOfficeId = boardOfficeId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToImplyRole(int roleId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(roleId, (await SingleAsync(dbContext, ct)).ImpliedRoleId)
        );

    public Expected ToImplyNoRole() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ImpliedRoleId)
        );

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    private Task<BoardOffice> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.BoardOffices.AsNoTracking().SingleAsync(row => row.Id == _boardOfficeId, ct);
}
