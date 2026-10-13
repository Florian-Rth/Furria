using Furria.Core.Media;

namespace Furria.Application.Operations;

public sealed record MediaCountSummary
{
    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int Count { get; init; }
}
