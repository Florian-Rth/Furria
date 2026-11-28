using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record StudioStepDetails
{
    public required int StepId { get; init; }

    public required string Name { get; init; }

    public required double? StartSeconds { get; init; }

    public required double? EndSeconds { get; init; }

    public required AnchorPlacement Placement { get; init; }

    public required AnchorPlacement EndPlacement { get; init; }

    public required bool StartNeedsCheck { get; init; }

    public required bool EndNeedsCheck { get; init; }
}
