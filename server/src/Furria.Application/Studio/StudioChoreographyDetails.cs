using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record StudioChoreographyDetails
{
    public required int Version { get; init; }

    public required ChoreographyDocument Document { get; init; }
}
