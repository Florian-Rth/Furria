using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record SaveEveningChoreographyCommand
{
    public required ActEveningCommand Evening { get; init; }

    public required int? ExpectedVersion { get; init; }

    public required int? SessionVersion { get; init; }

    public required ChoreographyDocument Document { get; init; }
}
