using Furria.Core.Club;

namespace Furria.Core.Groups;

public sealed class GroupKind : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
