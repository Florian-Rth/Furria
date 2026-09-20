namespace Furria.Application.Club;

public sealed record ClubHubAnnouncements
{
    public required IReadOnlyList<ClubHubAnnouncement> Newest { get; init; }

    public required int TotalCount { get; init; }
}
