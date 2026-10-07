namespace Furria.Application.Registry;

public sealed record PersonGroupAdminTenure
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
