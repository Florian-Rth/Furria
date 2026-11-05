using Furria.Core.BeerList;

namespace Furria.Tests.Common.Builder;

public sealed class BeerListSeedBuilder
{
    public const int DefaultCratePriceCents = 15_00;
    public const string DefaultPaymentLink = "https://paypal.me/getraenkewart";

    private readonly List<BeerPotIntent> _pots = [];
    private readonly List<BeerListEnrollmentIntent> _enrollments = [];
    private readonly List<BeerStockMovementIntent> _stockMovements = [];
    private readonly List<BeerCrateIntent> _crates = [];
    private readonly List<BeerPaymentIntent> _payments = [];
    private readonly List<BeerTabReminderIntent> _tabReminders = [];

    internal IReadOnlyList<BeerPotIntent> Pots => _pots;

    internal IReadOnlyList<BeerListEnrollmentIntent> Enrollments => _enrollments;

    internal IReadOnlyList<BeerStockMovementIntent> StockMovements => _stockMovements;

    internal IReadOnlyList<BeerCrateIntent> Crates => _crates;

    internal IReadOnlyList<BeerPaymentIntent> Payments => _payments;

    internal IReadOnlyList<BeerTabReminderIntent> TabReminders => _tabReminders;

    public BeerListSeedBuilder AddBeerPot(
        string alias,
        string ownerAlias,
        int cratePriceCents = DefaultCratePriceCents,
        string? paymentLink = DefaultPaymentLink,
        DateTimeOffset? openedAt = null,
        DateTimeOffset? closedAt = null
    )
    {
        _pots.Add(
            new BeerPotIntent(alias, ownerAlias, cratePriceCents, paymentLink, openedAt, closedAt)
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerListEnrollment(
        string alias,
        string personAlias,
        DateTimeOffset? startedAt = null,
        DateTimeOffset? endedAt = null,
        string? endedByAlias = null
    )
    {
        _enrollments.Add(
            new BeerListEnrollmentIntent(alias, personAlias, startedAt, endedAt, endedByAlias)
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerDelivery(
        string potAlias,
        int crates,
        DateTimeOffset? bookedAt = null,
        string? bookedByAlias = null
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                BeerStockMovementKind.Delivery,
                crates,
                bookedAt,
                bookedByAlias
            )
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerStockCorrection(
        string potAlias,
        int crates,
        DateTimeOffset? bookedAt = null,
        string? bookedByAlias = null
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                BeerStockMovementKind.Correction,
                crates,
                bookedAt,
                bookedByAlias
            )
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerCrate(
        string alias,
        string potAlias,
        string personAlias,
        DateTimeOffset? bookedAt = null,
        string? enteredByAlias = null,
        int? priceCents = null,
        DateTimeOffset? undoneAt = null
    )
    {
        _crates.Add(
            new BeerCrateIntent(
                alias,
                potAlias,
                personAlias,
                bookedAt,
                enteredByAlias,
                priceCents,
                undoneAt
            )
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerCrates(
        string potAlias,
        string personAlias,
        int count,
        DateTimeOffset? bookedAt = null
    )
    {
        for (var index = 0; index < count; index++)
            AddBeerCrate(
                $"{potAlias}-{personAlias}-{_crates.Count}",
                potAlias,
                personAlias,
                bookedAt
            );

        return this;
    }

    public BeerListSeedBuilder AddBeerPayment(
        string alias,
        string potAlias,
        string personAlias,
        int crates,
        DateTimeOffset? bookedAt = null,
        string? bookedByAlias = null,
        DateTimeOffset? undoneAt = null
    )
    {
        _payments.Add(
            new BeerPaymentIntent(
                alias,
                potAlias,
                personAlias,
                crates,
                bookedAt,
                bookedByAlias,
                undoneAt
            )
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerTabReminder(string personAlias, DateTimeOffset sentAt)
    {
        _tabReminders.Add(new BeerTabReminderIntent(personAlias, sentAt));
        return this;
    }

    internal sealed record BeerPotIntent(
        string Alias,
        string OwnerAlias,
        int CratePriceCents,
        string? PaymentLink,
        DateTimeOffset? OpenedAt,
        DateTimeOffset? ClosedAt
    );

    internal sealed record BeerListEnrollmentIntent(
        string Alias,
        string PersonAlias,
        DateTimeOffset? StartedAt,
        DateTimeOffset? EndedAt,
        string? EndedByAlias
    );

    internal sealed record BeerStockMovementIntent(
        string PotAlias,
        BeerStockMovementKind Kind,
        int Crates,
        DateTimeOffset? BookedAt,
        string? BookedByAlias
    );

    internal sealed record BeerCrateIntent(
        string Alias,
        string PotAlias,
        string PersonAlias,
        DateTimeOffset? BookedAt,
        string? EnteredByAlias,
        int? PriceCents,
        DateTimeOffset? UndoneAt
    );

    internal sealed record BeerPaymentIntent(
        string Alias,
        string PotAlias,
        string PersonAlias,
        int Crates,
        DateTimeOffset? BookedAt,
        string? BookedByAlias,
        DateTimeOffset? UndoneAt
    );

    internal sealed record BeerTabReminderIntent(string PersonAlias, DateTimeOffset SentAt);
}
