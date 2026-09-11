using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class RoleExpectations
{
    private readonly Expected _expected;
    private readonly int _roleId;

    internal RoleExpectations(Expected expected, int roleId)
    {
        _expected = expected;
        _roleId = roleId;
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

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    public Expected ToGrantExactly(params string[] permissionKeys) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var granted = await dbContext
                    .RolePermissions.AsNoTracking()
                    .Where(row => row.RoleId == _roleId)
                    .Select(row => row.PermissionKey)
                    .OrderBy(key => key)
                    .ToListAsync(ct);

                Assert.Equal(permissionKeys.OrderBy(key => key, StringComparer.Ordinal), granted);
            }
        );

    private Task<Role> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Roles.AsNoTracking().SingleAsync(row => row.Id == _roleId, ct);
}
