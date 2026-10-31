using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record ChoreographyWrite
{
    public required int? AccountId { get; init; }

    public required ChoreographyDocument Document { get; init; }

    public required ChoreographyVersionKind Kind { get; init; }

    public int? RestoredFromVersion { get; init; }
}
