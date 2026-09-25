namespace Furria.Application.Identity;

public sealed record RedeemInvitationCommand
{
    public required string Token { get; init; }

    public required string Password { get; init; }
}
