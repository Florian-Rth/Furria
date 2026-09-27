namespace Furria.Application.Identity;

public sealed record InvitationIssuer
{
    public required int PersonId { get; init; }

    public required bool VouchesForAge { get; init; }
}
