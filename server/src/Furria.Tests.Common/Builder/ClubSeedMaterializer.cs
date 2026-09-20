using Furria.Core.Club;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class ClubSeedMaterializer
{
    private static readonly IReadOnlyDictionary<string, int> NothingSeeded = new Dictionary<
        string,
        int
    >(StringComparer.Ordinal);

    internal static async Task<SeededClub> InsertAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> roleIds,
        CancellationToken ct
    )
    {
        var sessions = await InsertSessionsAsync(dbContext, recorded, ct);
        var venues = await InsertVenuesAsync(dbContext, recorded, ct);

        return new SeededClub(
            sessions,
            venues,
            NothingSeeded,
            NothingSeeded,
            NothingSeeded,
            NothingSeeded,
            NothingSeeded,
            NothingSeeded
        );
    }

    private static async Task<Dictionary<string, int>> InsertSessionsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var sessions = recorded.Sessions.ToDictionary(
            intent => intent.Alias,
            intent => new Session
            {
                StartYear = intent.StartYear,
                Number = intent.Number,
                Motto = intent.Motto,
                SignetSvg = intent.SignetSvg,
            },
            StringComparer.Ordinal
        );

        if (sessions.Count > 0)
        {
            dbContext.Sessions.AddRange(sessions.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return sessions.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertVenuesAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var venues = recorded.Venues.ToDictionary(
            intent => intent.Alias,
            intent => new Venue { Name = intent.Name, SortOrder = intent.SortOrder },
            StringComparer.Ordinal
        );

        if (venues.Count > 0)
        {
            dbContext.Venues.AddRange(venues.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return venues.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }
}
