namespace Furria.Application.Studio;

public sealed record ChoreographyVersionPage
{
    public required IReadOnlyList<ChoreographyVersionSummary> Versions { get; init; }

    public required int Total { get; init; }

    public required bool HasOlder { get; init; }
}
