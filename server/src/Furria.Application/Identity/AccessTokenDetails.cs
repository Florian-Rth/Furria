namespace Furria.Application.Identity;

public sealed record AccessTokenDetails
{
    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
