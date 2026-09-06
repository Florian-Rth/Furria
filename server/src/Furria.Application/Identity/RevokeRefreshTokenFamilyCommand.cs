namespace Furria.Application.Identity;

public sealed record RevokeRefreshTokenFamilyCommand
{
    public required string PresentedToken { get; init; }

    public required int AccountId { get; init; }

    public required RefreshTokenRevocationReason Reason { get; init; }
}
