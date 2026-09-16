using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class AffiliationLookup
{
    private readonly AppDbContext _dbContext;

    public AffiliationLookup(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlySet<int>> AffiliatedAmongAsync(
        IReadOnlyList<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var candidates = personIds.Distinct().ToList();

        if (candidates.Count == 0)
            return new HashSet<int>();

        var affiliated = await _dbContext
            .People.AsNoTracking()
            .Where(person => candidates.Contains(person.Id))
            .Where(AffiliationQuery.IsAffiliatedOn(today))
            .Select(person => person.Id)
            .ToListAsync(ct);

        return affiliated.ToHashSet();
    }
}
