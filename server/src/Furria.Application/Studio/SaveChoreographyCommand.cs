using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record SaveChoreographyCommand
{
    public required int ActId { get; init; }

    public required int? ExpectedVersion { get; init; }

    public required ChoreographyDocument Document { get; init; }
}
