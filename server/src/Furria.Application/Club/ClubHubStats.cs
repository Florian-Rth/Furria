namespace Furria.Application.Club;

public sealed record ClubHubStats
{
    public required int MemberCount { get; init; }

    public required int GroupCount { get; init; }

    public required int JoinedThisSessionCount { get; init; }
}
