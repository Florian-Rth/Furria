namespace Furria.Application.Club;

public sealed record PublicClubSession
{
    public required int StartYear { get; init; }

    public required string Label { get; init; }

    public required string? Motto { get; init; }
}
