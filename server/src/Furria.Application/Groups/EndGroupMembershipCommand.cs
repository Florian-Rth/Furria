namespace Furria.Application.Groups;

public sealed record EndGroupMembershipCommand
{
    public required int GroupId { get; init; }

    public required int GroupMembershipId { get; init; }

    public required DateOnly EndedOn { get; init; }
}
