namespace Furria.Core.Studio;

public readonly record struct ChoreographyProblem(
    ChoreographyProblemKind Kind,
    int SpotId,
    int? KeyframeIndex
);
