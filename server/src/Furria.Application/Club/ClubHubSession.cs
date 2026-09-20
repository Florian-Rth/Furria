namespace Furria.Application.Club;

public sealed record ClubHubSession
{
    public required int StartYear { get; init; }

    public required string Label { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? SignetSvg { get; init; }
}
