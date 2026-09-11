namespace Furria.Application.Registry;

public sealed record RoleReference
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }
}
