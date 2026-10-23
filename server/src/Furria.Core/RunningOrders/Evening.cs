using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

internal sealed class Evening
{
    private readonly IReadOnlyDictionary<LineKey, int> _indexes;
    private readonly IReadOnlyDictionary<LineKey, int> _unplacedRanks;

    public IReadOnlyList<ReviewLine> Sequence { get; }

    private Evening(IReadOnlyList<ReviewLine> sequence, IReadOnlyList<ReviewLine> unplaced)
    {
        Sequence = sequence;
        _indexes = sequence
            .Select((line, index) => (line.Key, index))
            .ToDictionary(pair => pair.Key, pair => pair.index);
        _unplacedRanks = unplaced
            .Select((line, index) => (line.Key, Rank: sequence.Count + index))
            .ToDictionary(ranked => ranked.Key, ranked => ranked.Rank);
    }

    [Pure]
    public static Evening Of(IReadOnlyList<ReviewLine> lines) =>
        new(
            [.. lines.Where(line => line.Position is not null).OrderBy(line => line.Position)],
            [.. lines.Where(line => line.Position is null)]
        );

    [Pure]
    public bool Places(int actId) => _indexes.ContainsKey(LineKey.OfAct(actId));

    [Pure]
    public int IndexOf(int actId) => _indexes[LineKey.OfAct(actId)];

    [Pure]
    public int RankOf(LineKey key) =>
        _indexes.TryGetValue(key, out var index) ? index : _unplacedRanks[key];
}
