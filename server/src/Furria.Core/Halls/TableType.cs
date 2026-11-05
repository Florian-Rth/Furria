using Furria.Core.Club;

namespace Furria.Core.Halls;

public sealed class TableType : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public TableShape Shape { get; set; }

    public int LengthCm { get; set; }

    public int WidthCm { get; set; }

    public bool SeatsAtEnds { get; set; }

    public int SortOrder { get; set; }

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
