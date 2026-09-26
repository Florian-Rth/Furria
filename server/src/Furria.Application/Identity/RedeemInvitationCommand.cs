namespace Furria.Application.Identity;

public sealed record RedeemInvitationCommand
{
    public required InvitationCredential Credential { get; init; }

    public required string? Password { get; init; }

    public required string? LoginEmail { get; init; }

    public required string? ConfirmationCode { get; init; }

    public required string? ClaimPassword { get; init; }
}
