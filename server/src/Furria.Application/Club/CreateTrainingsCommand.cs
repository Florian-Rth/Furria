namespace Furria.Application.Club;

public sealed record CreateTrainingsCommand
{
    public required int OwnerGroupId { get; init; }

    public required string Title { get; init; }

    public required IReadOnlyList<TrainingPlacement> Placements { get; init; }
}
