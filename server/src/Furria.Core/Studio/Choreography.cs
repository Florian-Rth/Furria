using Furria.Core.Club;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class Choreography : ITimestamped
{
    public const int FirstVersion = 1;

    public int Id { get; set; }

    public int ActId { get; set; }

    public int? AppearanceId { get; set; }

    public ChoreographyDocument Document { get; set; } = ChoreographyDocument.Empty;

    public int Version { get; set; } = FirstVersion;

    public int? CopiedFromVersion { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Act? Act { get; set; }

    public Appearance? Appearance { get; set; }
}
