namespace Furria.Application.Identity;

public sealed record DeleteAccountCommand
{
    public required int AccountId { get; init; }

    public required ReauthenticationProof Proof { get; init; }
}
