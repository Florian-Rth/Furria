namespace Furria.Application.Studio;

public sealed record StudioPartDetails
{
    public required int PartId { get; init; }

    public required string Name { get; init; }

    public required IReadOnlyList<int> StepIds { get; init; }

    public required int? MainVideoId { get; init; }

    public required bool IsAdrift { get; init; }
}
