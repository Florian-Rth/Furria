namespace Furria.Core.RunningOrders;

public sealed record RunningOrderReviewInput
{
    public required IReadOnlyList<ReviewLine> Lines { get; init; }

    public required IReadOnlyList<ReviewRule> Rules { get; init; }
}
