using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.GroupMatcher;

internal static class TakingPartStamp
{
    public static Task<int> StampCompleteAsync(
        this AppDbContext dbContext,
        IQueryable<Group> candidates,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var statements = dbContext.MatcherStatements;

        return candidates
            .Where(group =>
                group.GroupMatcherJoinedAt == null
                && statements.Any()
                && !statements.Any(statement =>
                    !statement.Stances.Any(stance => stance.GroupId == group.Id)
                )
            )
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(group => group.GroupMatcherJoinedAt, now)
                        .SetProperty(group => group.UpdatedAt, now),
                ct
            );
    }
}
