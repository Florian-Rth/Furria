namespace Furria.Application.Studio;

public sealed record AddedSpotDetails
{
    public required int SpotId { get; init; }

    public required int Number { get; init; }
}
