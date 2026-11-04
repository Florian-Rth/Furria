using Furria.Core.BeerList;

namespace Furria.Tests.Common.Builder;

public sealed class BeerListSeedBuilder
{
    public const int DefaultCratePriceCents = 15_00;
    public const string DefaultPaymentLink = "https://paypal.me/getraenkewart";

    private readonly List<BeerPotIntent> _pots = [];
    private readonly List<BeerListEnrollmentIntent> _enrollments = [];
    private readonly List<BeerStockMovementIntent> _stockMovements = [];

    internal IReadOnlyList<BeerPotIntent> Pots => _pots;

    internal IReadOnlyList<BeerListEnrollmentIntent> Enrollments => _enrollments;

    internal IReadOnlyList<BeerStockMovementIntent> StockMovements => _stockMovements;

    public BeerListSeedBuilder AddBeerPot(
        string alias,
        string ownerAlias,
        int cratePriceCents = DefaultCratePriceCents,
        string? paymentLink = DefaultPaymentLink,
        string? paymentNote = null,
        DateTimeOffset? openedAt = null,
        DateTimeOffset? closedAt = null
    )
    {
        _pots.Add(
            new BeerPotIntent(
                alias,
                ownerAlias,
                cratePriceCents,
                paymentLink,
                paymentNote,
                openedAt,
                closedAt
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
        string? bookedByAlias = null
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                BeerStockMovementKind.Delivery,
                crates,
                null,
                bookedAt,
                bookedByAlias
            )
        );
        return this;
    }

    public BeerListSeedBuilder AddBeerStockCorrection(
        string potAlias,
        int crates,
        BeerStockCorrectionReason reason,
        DateTimeOffset? bookedAt = null,
        string? bookedByAlias = null
    )
    {
        _stockMovements.Add(
            new BeerStockMovementIntent(
                potAlias,
                BeerStockMovementKind.Correction,
                crates,
                reason,
                bookedAt,
                bookedByAlias
            )
        );
        return this;
    }

    internal sealed record BeerPotIntent(
        string Alias,
        string OwnerAlias,
        int CratePriceCents,
        string? PaymentLink,
        string? PaymentNote,
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
        BeerStockCorrectionReason? Reason,
        DateTimeOffset? BookedAt,
        string? BookedByAlias
    );
}
