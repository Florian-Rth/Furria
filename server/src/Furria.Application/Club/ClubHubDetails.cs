namespace Furria.Application.Club;

public sealed record ClubHubDetails
{
    public required ClubHubSession Session { get; init; }

    public required ClubHubStats Stats { get; init; }

    public required ClubHubAnnouncements Announcements { get; init; }

    public required IReadOnlyList<ClubHubCalendarEntry> Calendar { get; init; }

    public required IReadOnlyList<ClubHubBoardSeat> Board { get; init; }

    public required IReadOnlyList<ClubHubVenue> Venues { get; init; }
}
