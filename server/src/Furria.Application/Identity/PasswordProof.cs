namespace Furria.Application.Identity;

public sealed record PasswordProof : ReauthenticationProof
{
    public required string Password { get; init; }
}
