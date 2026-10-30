namespace Furria.Application.Studio;

public sealed record EveningSpotCommand
{
    public required ActEveningCommand Evening { get; init; }

    public required int SpotId { get; init; }

    public required int? PersonId { get; init; }
}
