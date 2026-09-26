namespace Furria.Application.Identity;

public sealed record ReauthenticationProof
{
    public required string Password { get; init; }
}
