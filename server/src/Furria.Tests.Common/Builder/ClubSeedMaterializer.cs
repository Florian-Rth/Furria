using Furria.Core.Club;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class ClubSeedMaterializer
{
    internal static async Task<SeededClub> InsertAsync(
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

        return new SeededClub(
            sessions.ToDictionary(
                entry => entry.Key,
                entry => entry.Value.Id,
                StringComparer.Ordinal
            )
        );
    }
}
