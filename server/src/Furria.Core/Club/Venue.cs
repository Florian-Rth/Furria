namespace Furria.Core.Club;

public sealed class Venue : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public int SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
