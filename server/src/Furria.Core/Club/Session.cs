namespace Furria.Core.Club;

public sealed class Session : ITimestamped
{
    public int Id { get; set; }

    public int StartYear { get; set; }

    public int? Number { get; set; }

    public string? Motto { get; set; }

    public string? ArtworkSvg { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
