namespace Furria.Application.Groups;

public sealed record AddGroupMembershipCommand
{
    public required int GroupId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly JoinedOn { get; init; }
}
