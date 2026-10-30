using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record StudioEveningChoreographyDetails
{
    public required int Version { get; init; }

    public required int? CopiedFromVersion { get; init; }

    public required ChoreographyDocument Document { get; init; }
}
