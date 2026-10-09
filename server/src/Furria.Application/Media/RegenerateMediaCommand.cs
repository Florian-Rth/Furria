namespace Furria.Application.Media;

public sealed record RegenerateMediaCommand
{
    public required MediaRegenerationScope Scope { get; init; }

    public IReadOnlyCollection<int> MediaItemIds { get; init; } = [];
}
