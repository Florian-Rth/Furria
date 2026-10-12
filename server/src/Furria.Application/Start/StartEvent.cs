using Furria.Application.Media;

namespace Furria.Application.Start;

public sealed record StartEvent
{
    public required bool IsCancelled { get; init; }

    public required PictureDetails? Picture { get; init; }
}
