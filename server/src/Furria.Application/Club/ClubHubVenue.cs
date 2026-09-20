namespace Furria.Application.Club;

public sealed record ClubHubVenue
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required IReadOnlyList<ClubHubKeyHolder> Holders { get; init; }
}
