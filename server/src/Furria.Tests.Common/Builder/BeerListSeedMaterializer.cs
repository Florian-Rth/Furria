using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class BeerListSeedMaterializer
{
    private static readonly TimeSpan SeededAge = TimeSpan.FromDays(30);
    private static readonly TimeSpan SeededStockAge = TimeSpan.FromDays(10);
    private static readonly TimeSpan SeededPaymentAge = TimeSpan.FromDays(1);

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

        var crates = recorded.Crates.ToDictionary(
            intent => intent.Alias,
            intent => NewCrate(intent, pots, personIds, now),
            StringComparer.Ordinal
        );
        dbContext.BeerCrates.AddRange(crates.Values);

        var payments = recorded.Payments.ToDictionary(
            intent => intent.Alias,
            intent => NewPayment(intent, pots, personIds, crates.Values, now),
            StringComparer.Ordinal
        );
        dbContext.BeerPayments.AddRange(payments.Values);

        dbContext.BeerTabReminders.AddRange(
            recorded.TabReminders.Select(intent => NewTabReminder(intent, personIds))
        );

        await dbContext.SaveChangesAsync(ct);

        return new SeededBeerList(
            pots.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            enrollments.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            crates.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            payments.ToDictionary(entry => entry.Key, entry => entry.Value.Id)
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

    private static BeerCrate NewCrate(
        BeerListSeedBuilder.BeerCrateIntent intent,
        IReadOnlyDictionary<string, BeerPot> pots,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    )
    {
        var pot = PotOf(pots, intent.PotAlias);
        return new()
        {
            Pot = pot,
            PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
            PriceCents = intent.PriceCents ?? pot.CratePriceCents,
            EnteredByPersonId = SeedAliases.RequireId(
                personIds,
                intent.EnteredByAlias ?? intent.PersonAlias,
                "Person"
            ),
            BookedAt = intent.BookedAt ?? now - SeededStockAge,
            UndoneAt = intent.UndoneAt,
        };
    }

    private static BeerPayment NewPayment(
        BeerListSeedBuilder.BeerPaymentIntent intent,
        IReadOnlyDictionary<string, BeerPot> pots,
        IReadOnlyDictionary<string, int> personIds,
        IEnumerable<BeerCrate> crates,
        DateTimeOffset now
    )
    {
        var pot = PotOf(pots, intent.PotAlias);
        var personId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person");
        var payment = new BeerPayment
        {
            Pot = pot,
            PersonId = personId,
            Crates = intent.Crates,
            AmountCents = intent.Crates * pot.CratePriceCents,
            BookedByPersonId = intent.BookedByAlias is null
                ? null
                : SeedAliases.RequireId(personIds, intent.BookedByAlias, "Person"),
            BookedAt = intent.BookedAt ?? now - SeededPaymentAge,
            UndoneAt = intent.UndoneAt,
        };
        if (intent.UndoneAt is not null)
            return payment;

        var settled = crates
            .Where(crate =>
                crate.Pot == pot
                && crate.PersonId == personId
                && crate.UndoneAt is null
                && crate.PaidByPayment is null
            )
            .OrderBy(crate => crate.BookedAt)
            .Take(intent.Crates)
            .ToList();
        if (settled.Count != intent.Crates)
            throw new InvalidOperationException(
                $"BeerPayment '{intent.Alias}' settles more crates than are open."
            );

        settled.ForEach(crate => crate.PaidByPayment = payment);
        payment.AmountCents = settled.Sum(crate => crate.PriceCents);
        return payment;
    }

    private static BeerTabReminder NewTabReminder(
        BeerListSeedBuilder.BeerTabReminderIntent intent,
        IReadOnlyDictionary<string, int> personIds
    ) =>
        new()
        {
            PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
            SentAt = intent.SentAt,
        };

    private static BeerPot PotOf(IReadOnlyDictionary<string, BeerPot> pots, string potAlias) =>
        pots.TryGetValue(potAlias, out var pot)
            ? pot
            : throw new InvalidOperationException($"BeerPot alias '{potAlias}' unknown.");

    private static BeerStockMovement NewStockMovement(
        BeerListSeedBuilder.BeerStockMovementIntent intent,
        IReadOnlyDictionary<string, BeerPot> pots,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    ) =>
        new()
        {
            Pot = PotOf(pots, intent.PotAlias),
            Kind = intent.Kind,
            Crates = intent.Crates,
            Reason = intent.Reason,
            BookedAt = intent.BookedAt ?? now - SeededStockAge,
            BookedByPersonId = intent.BookedByAlias is null
                ? null
                : SeedAliases.RequireId(personIds, intent.BookedByAlias, "Person"),
        };
}
