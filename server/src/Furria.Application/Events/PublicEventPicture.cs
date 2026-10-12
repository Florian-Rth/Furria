using Furria.Application.Media;

namespace Furria.Application.Events;

public sealed record PublicEventPicture
{
    public required int Width { get; init; }

    public required int Height { get; init; }

    public required PictureDetails Picture { get; init; }
}
