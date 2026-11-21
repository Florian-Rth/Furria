namespace Furria.Application.Registry;

public sealed record PersonArchivedParentTie
{
    public required ArchivedParentTieKind Kind { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }
}
