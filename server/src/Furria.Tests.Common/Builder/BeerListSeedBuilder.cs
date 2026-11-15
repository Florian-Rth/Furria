using Furria.Core.BeerList;

namespace Furria.Tests.Common.Builder;

public sealed class BeerListSeedBuilder
{
    public const int DefaultCratePriceCents = 15_00;
    public const string DefaultPaymentLink = "https://paypal.me/getraenkewart";
    public const string DefaultDrink = "Bier";

    private readonly List<BeerPotIntent> _pots = [];
    private readonly List<BeerPotDrinkIntent> _potDrinks = [];
    private readonly List<BeerListEnrollmentIntent> _enrollments = [];
    private readonly List<BeerStockMovementIntent> _stockMovements = [];
    private readonly List<BeerCrateIntent> _crates = [];
    private readonly List<BeerPaymentIntent> _payments = [];
    private readonly List<BeerTabReminderIntent> _tabReminders = [];

    internal IReadOnlyList<BeerPotIntent> Pots => _pots;

    internal IReadOnlyList<BeerPotDrinkIntent> PotDrinks => _potDrinks;

    internal IReadOnlyList<BeerListEnrollmentIntent> Enrollments => _enrollments;

    internal IReadOnlyList<BeerStockMovementIntent> StockMovements => _stockMovements;

    internal IReadOnlyList<BeerCrateIntent> Crates => _crates;

    internal IReadOnlyList<BeerPaymentIntent> Payments => _payments;

    internal IReadOnlyList<BeerTabReminderIntent> TabReminders => _tabReminders;

    private void ClearDefaultOf(string potAlias)
    {
        for (var index = 0; index < _potDrinks.Count; index++)
            if (_potDrinks[index].PotAlias == potAlias)
                _potDrinks[index] = _potDrinks[index] with { IsDefault = false };
    }

    public BeerListSeedBuilder AddBeerPot(
        string alias,
        string ownerAlias,
        int cratePriceCents = DefaultCratePriceCents,
        string? paymentLink = DefaultPaymentLink,
        DateTimeOffset? openedAt = null,
        DateTimeOffset? closedAt = null,
        DateTimeOffset? stockWarningSentAt = null
    )
    {
        _pots.Add(new BeerPotIntent(alias, ownerAlias, paymentLink, openedAt, closedAt));
        return AddBeerDrink(
            alias,
            DefaultDrink,
            cratePriceCents,
            stockWarningSentAt: stockWarningSentAt,
            isDefault: true
        );
    }

    public BeerListSeedBuilder AddBeerDrink(
        string potAlias,
        string drink,
        int cratePriceCents = DefaultCratePriceCents,
        DateTimeOffset? retiredAt = null,
        DateTimeOffset? stockWarningSentAt = null,
        bool isDefault = false
    )
    {
        if (isDefault)
            ClearDefaultOf(potAlias);

        _potDrinks.Add(
            new BeerPotDrinkIntent(
                potAlias,
                drink,
                cratePriceCents,
                retiredAt,
                stockWarningSentAt,
                isDefault
            )
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
        string? bookedByAlias = null,
        string drink = DefaultDrink
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                drink,
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
        string? bookedByAlias = null,
        string drink = DefaultDrink
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                drink,
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
        DateTimeOffset? undoneAt = null,
        string drink = DefaultDrink
    )
    {
        _crates.Add(
            new BeerCrateIntent(
                alias,
                potAlias,
                drink,
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
        DateTimeOffset? bookedAt = null,
        string drink = DefaultDrink
    )
    {
        for (var index = 0; index < count; index++)
            AddBeerCrate(
                $"{potAlias}-{personAlias}-{_crates.Count}",
                potAlias,
                personAlias,
                bookedAt,
                drink: drink
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
        string? PaymentLink,
        DateTimeOffset? OpenedAt,
        DateTimeOffset? ClosedAt
    );

    internal sealed record BeerPotDrinkIntent(
        string PotAlias,
        string Drink,
        int CratePriceCents,
        DateTimeOffset? RetiredAt,
        DateTimeOffset? StockWarningSentAt,
        bool IsDefault
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
        string Drink,
        BeerStockMovementKind Kind,
        int Crates,
        DateTimeOffset? BookedAt,
        string? BookedByAlias
    );

    internal sealed record BeerCrateIntent(
        string Alias,
        string PotAlias,
        string Drink,
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
