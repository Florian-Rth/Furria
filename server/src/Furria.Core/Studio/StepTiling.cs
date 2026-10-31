namespace Furria.Core.Studio;

public sealed record StepTiling(IReadOnlyList<StepSpan> Spans, IReadOnlyList<int> AdriftStepIds);
