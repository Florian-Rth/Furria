namespace Furria.Core.Events;

public sealed record EventReadinessFacts
{
    public required DateOnly EventDay { get; init; }

    public required DateOnly CreatedDay { get; init; }

    public required bool IsCancelled { get; init; }

    public required bool IsOver { get; init; }

    public required bool AreDetailsDone { get; init; }

    public required bool AreTicketsSet { get; init; }

    public required DateTimeOffset? OldestOpenRequestAt { get; init; }

    public required bool HasPublishedAlbum { get; init; }
}
