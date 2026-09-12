namespace Furria.Application.Registry;

public sealed record PersonRole
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
