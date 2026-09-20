namespace Furria.Application.Club;

public sealed record SessionRecordSummary
{
    public required int SessionId { get; init; }

    public required int StartYear { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? LogoSvg { get; init; }
}
