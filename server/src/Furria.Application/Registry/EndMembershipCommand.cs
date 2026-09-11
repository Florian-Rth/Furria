namespace Furria.Application.Registry;

public sealed record EndMembershipCommand
{
    public required int PersonId { get; init; }

    public required int MembershipId { get; init; }

    public required DateOnly EndedOn { get; init; }
}
