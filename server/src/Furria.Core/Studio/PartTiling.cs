namespace Furria.Core.Studio;

public sealed record PartTiling(IReadOnlyList<PartSpan> Spans, IReadOnlyList<int> AdriftPartIds);
