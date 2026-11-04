using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class BeerListSeedMaterializer
{
    private static readonly TimeSpan SeededAge = TimeSpan.FromDays(30);
    private static readonly TimeSpan SeededStockAge = TimeSpan.FromDays(10);

    internal static async Task<SeededBeerList> InsertAsync(
        AppDbContext dbContext,
        BeerListSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var pots = recorded.Pots.ToDictionary(
            intent => intent.Alias,
            intent => NewPot(intent, personIds, now),
            StringComparer.Ordinal
        );
        dbContext.BeerPots.AddRange(pots.Values);

        var enrollments = recorded.Enrollments.ToDictionary(
            intent => intent.Alias,
            intent => NewEnrollment(intent, personIds, now),
            StringComparer.Ordinal
        );
        dbContext.BeerListEnrollments.AddRange(enrollments.Values);

        dbContext.BeerStockMovements.AddRange(
            recorded.StockMovements.Select(intent => NewStockMovement(intent, pots, personIds, now))
        );

        await dbContext.SaveChangesAsync(ct);

        return new SeededBeerList(
            pots.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            enrollments.ToDictionary(entry => entry.Key, entry => entry.Value.Id)
        );
    }

    private static BeerPot NewPot(
        BeerListSeedBuilder.BeerPotIntent intent,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    ) =>
        new()
        {
            OwnerPersonId = SeedAliases.RequireId(personIds, intent.OwnerAlias, "Person"),
            CratePriceCents = intent.CratePriceCents,
            PaymentLink = intent.PaymentLink,
            PaymentNote = intent.PaymentNote,
            OpenedAt = intent.OpenedAt ?? now - SeededAge,
            ClosedAt = intent.ClosedAt,
        };

    private static BeerListEnrollment NewEnrollment(
        BeerListSeedBuilder.BeerListEnrollmentIntent intent,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    ) =>
        new()
        {
            PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
            StartedAt = intent.StartedAt ?? now - SeededAge,
            EndedAt = intent.EndedAt,
            EndedByPersonId = intent.EndedByAlias is null
                ? null
                : SeedAliases.RequireId(personIds, intent.EndedByAlias, "Person"),
        };

    private static BeerStockMovement NewStockMovement(
        BeerListSeedBuilder.BeerStockMovementIntent intent,
        IReadOnlyDictionary<string, BeerPot> pots,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    ) =>
        new()
        {
            Pot = pots.TryGetValue(intent.PotAlias, out var pot)
                ? pot
                : throw new InvalidOperationException(
                    $"BeerPot alias '{intent.PotAlias}' unknown."
                ),
            Kind = intent.Kind,
            Crates = intent.Crates,
            Reason = intent.Reason,
            BookedAt = intent.BookedAt ?? now - SeededStockAge,
            BookedByPersonId = intent.BookedByAlias is null
                ? null
                : SeedAliases.RequireId(personIds, intent.BookedByAlias, "Person"),
        };
}
