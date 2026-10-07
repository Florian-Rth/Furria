using Furria.Application.Identity;

namespace Furria.Application.Registry;

public sealed record PersonErasureCommand
{
    public required int PersonId { get; init; }

    public required int ActorAccountId { get; init; }

    public required ReauthenticationProof Proof { get; init; }
}
