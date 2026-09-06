namespace Furria.Application.Identity;

public sealed record IssuedRefreshTokenDetails
{
    public required int AccountId { get; init; }

    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
