using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public static class ActSessionsQuery
{
    public static async Task<IReadOnlySet<GroupSession>> ActSessionsOfAsync(
        this AppDbContext dbContext,
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    )
    {
        if (groupIds.Count == 0)
            return new HashSet<GroupSession>();

        var rows = await dbContext
            .Acts.AsNoTracking()
            .Where(act =>
                act.ArchivedAt == null
                && act.SessionYear != null
                && act.GroupId != null
                && groupIds.Contains(act.GroupId.Value)
            )
            .Select(act => new
            {
                GroupId = act.GroupId!.Value,
                SessionYear = act.SessionYear!.Value,
            })
            .Distinct()
            .ToListAsync(ct);

        return rows.Select(row => new GroupSession(row.GroupId, row.SessionYear)).ToHashSet();
    }
}
