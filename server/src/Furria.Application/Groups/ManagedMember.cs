namespace Furria.Application.Groups;

public sealed record ManagedMember
{
    public required int GroupMembershipId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }

    public required DateOnly Since { get; init; }
}
