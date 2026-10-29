using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record StudioMusicDetails
{
    public required double LengthSeconds { get; init; }

    public required StudioMusicSource Source { get; init; }
}
