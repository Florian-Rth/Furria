using Furria.Core.GroupMatcher;
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
        var approved = dbContext.MatcherStatements.Where(statement =>
            statement.Status == MatcherStatementStatus.Approved
        );

        return candidates
            .Where(group =>
                group.GroupMatcherJoinedAt == null
                && approved.Any()
                && !approved.Any(statement =>
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
