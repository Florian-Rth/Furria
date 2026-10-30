using Furria.Core.Identity;

namespace Furria.Core.Studio;

public sealed class ChoreographyVersion
{
    public int Id { get; set; }

    public int ChoreographyId { get; set; }

    public int Version { get; set; }

    public ChoreographyVersionKind Kind { get; set; }

    public int? RestoredFromVersion { get; set; }

    public ChoreographyDocument Document { get; set; } = ChoreographyDocument.Empty;

    public int? SavedByPersonId { get; set; }

    public DateTimeOffset SavedAt { get; set; }

    public Choreography? Choreography { get; set; }

    public Person? SavedBy { get; set; }
}
