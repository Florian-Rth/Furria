namespace Furria.Application.Club;

public sealed record ClubHubBoardSeat
{
    public required ClubHubPerson Person { get; init; }

    public required string OfficeName { get; init; }

    public required int SortOrder { get; init; }
}
