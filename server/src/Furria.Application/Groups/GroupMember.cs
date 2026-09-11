namespace Furria.Application.Groups;

public sealed record GroupMember
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly Since { get; init; }
}
