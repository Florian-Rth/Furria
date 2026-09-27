namespace Furria.Application.Identity;

public sealed record PasskeyProof : ReauthenticationProof
{
    public required PasskeyAssertion Assertion { get; init; }
}
