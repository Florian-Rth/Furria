namespace Furria.Tests.Common.Builder;

public sealed class BeerListSeedBuilder
{
    public const int DefaultCratePriceCents = 15_00;
    public const string DefaultPaymentLink = "https://paypal.me/getraenkewart";

    private readonly List<BeerPotIntent> _pots = [];
    private readonly List<BeerListEnrollmentIntent> _enrollments = [];

    internal IReadOnlyList<BeerPotIntent> Pots => _pots;

    internal IReadOnlyList<BeerListEnrollmentIntent> Enrollments => _enrollments;

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
}
