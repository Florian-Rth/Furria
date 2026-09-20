namespace Furria.Core.Club;

public sealed class Venue : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Street { get; set; } = "";

    public string Zip { get; set; } = "";

    public string City { get; set; } = "";

    public string? Hint { get; set; }

    public int SortOrder { get; set; }

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
