namespace Furria.Application.Studio;

public sealed record AssignSpotCommand
{
    public required int ActId { get; init; }

    public required int SpotId { get; init; }

    public required int? PersonId { get; init; }
}
