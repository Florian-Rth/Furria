namespace Furria.Application.Studio;

public sealed record StudioAudioUrls
{
    public required string Normalised { get; init; }

    public required string Preview { get; init; }

    public required string Peaks { get; init; }
}
