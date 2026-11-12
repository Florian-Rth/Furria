using Furria.Application.Authorization;
using Furria.Core.Ties;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class AnnouncementReaderAccounts
{
    internal static Task<List<int>> PushableReaderAccountIdsAsync(
        this AppDbContext dbContext,
        int? exceptPersonId,
        DateOnly today,
        CancellationToken ct
    )
    {
        var readers = dbContext
            .Memberships.Where(Running.Memberships(today))
            .Select(membership => membership.PersonId)
            .Union(
                PermissionHolderQuery.PersonIdsHolding(dbContext, FurriaPermissions.ClubRead, today)
            );

        return dbContext
            .PushableAccounts()
            .Where(account => account.PersonId != exceptPersonId)
            .Where(account => readers.Contains(account.PersonId!.Value))
            .OrderBy(account => account.Id)
            .Select(account => account.Id)
            .ToListAsync(ct);
    }
}
