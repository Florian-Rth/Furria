namespace Furria.Application.Registry;

public sealed record MemberRole
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required DateOnly Since { get; init; }
}
