using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class ChangeoverGaps
{
    private readonly IReadOnlyDictionary<LineKey, IReadOnlyList<int>> _presentByLine;

    public IReadOnlyList<LineKey> Original { get; }

    public IReadOnlyList<LineKey> Proposed { get; }

    public ChangeoverGaps(
        RunningOrderReviewInput input,
        IReadOnlyList<LineKey> original,
        IReadOnlyList<LineKey> proposed
    )
    {
        Original = original;
        Proposed = proposed;
        _presentByLine = input.Lines.ToDictionary(
            line => line.Key,
            line =>
                (IReadOnlyList<int>)
                    [
                        .. line
                            .Cast.Where(member => !member.IsAbsent)
                            .Select(member => member.PersonId)
                            .Distinct()
                            .Order(),
                    ]
        );
    }

    [Pure]
    public IReadOnlyList<int> PersonsWithMoreRoomAround(LineKey key) =>
        Original.Contains(key)
            ?
            [
                .. _presentByLine[key]
                    .Where(person =>
                        TightestGapAround(Proposed, key, person)
                        > TightestGapAround(Original, key, person)
                    ),
            ]
            : [];

    [Pure]
    private int TightestGapAround(IReadOnlyList<LineKey> order, LineKey key, int person)
    {
        var appearances = order
            .Select((candidate, index) => (candidate, index))
            .Where(pair => _presentByLine[pair.candidate].Contains(person))
            .Select(pair => pair.index)
            .ToList();
        var at = appearances.IndexOf(order.ToList().IndexOf(key));
        var before = at > 0 ? appearances[at] - appearances[at - 1] - 1 : int.MaxValue;
        var after =
            at + 1 < appearances.Count ? appearances[at + 1] - appearances[at] - 1 : int.MaxValue;

        return Math.Min(before, after);
    }
}
