using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class UnitLayout
{
    private readonly IReadOnlyDictionary<int, PlanUnit> _anchorsByStart;

    public IReadOnlyList<PlanUnit> CurrentOrder { get; }

    public IReadOnlyList<PlanUnit> Movable { get; }

    public IReadOnlyList<PlanUnit> Tray { get; }

    public int UnitCount { get; }

    public int Length { get; }

    public IReadOnlyList<PlanUnit?> TwinBefore { get; }

    private UnitLayout(
        IReadOnlyDictionary<int, PlanUnit> anchorsByStart,
        IReadOnlyList<PlanUnit> currentOrder,
        IReadOnlyList<PlanUnit> tray,
        IReadOnlyCollection<LineKey> ruled
    )
    {
        _anchorsByStart = anchorsByStart;
        CurrentOrder = currentOrder;
        Tray = tray;
        Movable = [.. currentOrder.Where(unit => !IsAnchor(unit)), .. tray];
        UnitCount = currentOrder.Count + tray.Count;
        Length =
            Movable.Sum(unit => unit.Lines.Count)
            + anchorsByStart.Values.Sum(unit => unit.Lines.Count);
        TwinBefore = TwinsBefore(Movable, UnitCount, ruled);
    }

    [Pure]
    public static UnitLayout Of(RunningOrderReviewInput input, PlanFacts facts)
    {
        var anchorsByStart = new Dictionary<int, PlanUnit>();
        var currentOrder = new List<PlanUnit>();
        var start = 0;
        foreach (var run in RunsOf(PlacedOf(input)))
        {
            var unit = new PlanUnit(
                currentOrder.Count,
                [.. run.Select(line => facts.LineOf(line.Key))]
            );
            if (run.Any(line => line.IsPinned))
                anchorsByStart[start] = unit;
            currentOrder.Add(unit);
            start += run.Count;
        }

        var tray = input
            .Lines.Where(line => line.Position is null)
            .Select(
                (line, index) => new PlanUnit(currentOrder.Count + index, [facts.LineOf(line.Key)])
            )
            .ToList();

        return new UnitLayout(anchorsByStart, currentOrder, tray, RuledLinesOf(input));
    }

    [Pure]
    public IReadOnlyList<PlanUnit>? Arrange(IReadOnlyList<PlanUnit> movableOrder)
    {
        var arranged = new List<PlanUnit>();
        var (length, next) = (0, 0);
        while (next < movableOrder.Count || _anchorsByStart.ContainsKey(length))
        {
            if (_anchorsByStart.TryGetValue(length, out var anchor))
            {
                arranged.Add(anchor);
                length += anchor.Lines.Count;
                continue;
            }

            var unit = movableOrder[next++];
            if (!FitsBetweenAnchors(unit, length))
                return null;

            arranged.Add(unit);
            length += unit.Lines.Count;
        }

        return arranged.Count == movableOrder.Count + _anchorsByStart.Count ? arranged : null;
    }

    [Pure]
    public PlanUnit? AnchorAt(int start) => _anchorsByStart.GetValueOrDefault(start);

    [Pure]
    public bool IsAnchor(PlanUnit unit) => _anchorsByStart.Values.Contains(unit);

    [Pure]
    public bool Fits(PlanUnit unit, int start) =>
        start + unit.Lines.Count <= Length && FitsBetweenAnchors(unit, start);

    [Pure]
    private bool FitsBetweenAnchors(PlanUnit unit, int start)
    {
        for (var index = start + 1; index < start + unit.Lines.Count; index++)
        {
            if (_anchorsByStart.ContainsKey(index))
                return false;
        }

        return true;
    }

    [Pure]
    private static PlanUnit?[] TwinsBefore(
        IReadOnlyList<PlanUnit> movable,
        int unitCount,
        IReadOnlyCollection<LineKey> ruled
    )
    {
        var twinBefore = new PlanUnit?[unitCount];
        var interchangeable = movable.Where(unit =>
            unit.Lines.Count == 1 && !ruled.Contains(unit.Lines[0].Key)
        );
        foreach (var twins in interchangeable.GroupBy(TwinSignatureOf))
        {
            var ascending = twins.OrderBy(unit => unit.FirstActId).ToList();
            for (var index = 1; index < ascending.Count; index++)
                twinBefore[ascending[index].Index] = ascending[index - 1];
        }

        return twinBefore;
    }

    [Pure]
    private static string TwinSignatureOf(PlanUnit unit) =>
        $"{unit.Lines[0].ActKind}:{string.Join(',', unit.Lines[0].PersonSlots)}";

    [Pure]
    private static HashSet<LineKey> RuledLinesOf(RunningOrderReviewInput input) =>
        [
            .. input
                .Rules.SelectMany(rule => new[] { rule.ActId, rule.OtherActId })
                .OfType<int>()
                .Select(LineKey.OfAct),
        ];

    [Pure]
    private static IReadOnlyList<ReviewLine> PlacedOf(RunningOrderReviewInput input) =>
        [.. input.Lines.Where(line => line.Position is not null).OrderBy(line => line.Position)];

    [Pure]
    private static IEnumerable<IReadOnlyList<ReviewLine>> RunsOf(IReadOnlyList<ReviewLine> placed)
    {
        var run = new List<ReviewLine>();
        foreach (var line in placed)
        {
            if (run.Count > 0 && (line.BlockKey is null || line.BlockKey != run[^1].BlockKey))
            {
                yield return run;
                run = [];
            }

            run.Add(line);
        }

        if (run.Count > 0)
            yield return run;
    }
}
