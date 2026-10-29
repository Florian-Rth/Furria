namespace Furria.Application.Club;

public sealed record UpdateClubStageCommand
{
    public required decimal WidthMetres { get; init; }

    public required decimal DepthMetres { get; init; }

    public required string? ArtworkSvg { get; init; }
}
