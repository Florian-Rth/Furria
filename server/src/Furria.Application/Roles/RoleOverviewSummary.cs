namespace Furria.Application.Roles;

public sealed record RoleOverviewSummary
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required IReadOnlyList<RoleOverviewHolder> Holders { get; init; }
}
