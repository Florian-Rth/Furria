namespace Furria.Application.Groups;

public sealed record MyGroupSummary
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required bool IsMember { get; init; }

    public required bool IsAdmin { get; init; }
}
