namespace Furria.Application.Promo;

public sealed record PromoMemberSummary
{
    public required int AccountId { get; init; }

    public required string FirstName { get; init; }

    public required string LastInitial { get; init; }

    public required DateTimeOffset? ArrivedAt { get; init; }
}
