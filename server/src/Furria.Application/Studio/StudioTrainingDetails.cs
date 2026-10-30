namespace Furria.Application.Studio;

public sealed record StudioTrainingDetails
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required bool AsksForResponse { get; init; }

    public required IReadOnlyList<int> OpenSpotIds { get; init; }
}
