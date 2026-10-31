namespace Furria.Application.Studio;

public sealed record ChoreographyVersionPage
{
    public static readonly ChoreographyVersionPage Empty = new()
    {
        Versions = [],
        Total = 0,
        HasOlder = false,
    };

    public required IReadOnlyList<ChoreographyVersionSummary> Versions { get; init; }

    public required int Total { get; init; }

    public required bool HasOlder { get; init; }
}
