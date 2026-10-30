namespace Furria.Application.Studio;

public sealed record RemoveSpotCommand
{
    public required int ActId { get; init; }

    public required int SpotId { get; init; }
}
