namespace Furria.Core.Events;

public sealed record EventDetailsFacts
{
    public required bool HasVenue { get; init; }

    public required bool HasDoorsOpenAt { get; init; }

    public required bool HasDescription { get; init; }

    public required bool HasPicture { get; init; }

    public required bool IsPublished { get; init; }
}
