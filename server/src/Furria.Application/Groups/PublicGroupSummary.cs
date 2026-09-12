namespace Furria.Application.Groups;

public sealed record PublicGroupSummary
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }
}
