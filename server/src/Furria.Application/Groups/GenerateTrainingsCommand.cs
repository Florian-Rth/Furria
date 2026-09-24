namespace Furria.Application.Groups;

public sealed record GenerateTrainingsCommand
{
    public required int GroupId { get; init; }

    public required int ViewerPersonId { get; init; }

    public required string Title { get; init; }

    public required IReadOnlyList<TrainingInstant> Instants { get; init; }
}
