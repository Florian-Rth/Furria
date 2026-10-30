namespace Furria.Core.RunningOrders.Planning;

internal sealed class OrderSearch
{
    private readonly RunningOrderCostPipeline _pipeline;
    private readonly UnitLayout _layout;
    private readonly SearchControl _control;
    private readonly PartialOrder _partial;
    private readonly List<PlanUnit> _chosen = [];
    private readonly List<long> _addedCosts = [];
    private readonly bool[] _used;
    private readonly ChangeoverBound _changeoverBound;
    private long _cost;
    private long _limit;
    private IReadOnlyList<PlanUnit> _best = [];
    private int _nodes;
    private bool _isCanonicalPass;
    private bool _isSettled;
    private bool _isRoomCounted;
    private int _phaseBudget;

    private bool IsExhausted => _nodes >= _phaseBudget || _control.Stop.IsCancellationRequested;

    private OrderSearch(RunningOrderCostPipeline pipeline, UnitLayout layout, SearchControl control)
    {
        _pipeline = pipeline;
        _layout = layout;
        _control = control;
        _phaseBudget = control.NodeBudget / 4 * 3;
        _used = new bool[layout.UnitCount];
        _partial = new PartialOrder(pipeline.Facts);
        _changeoverBound = new ChangeoverBound(pipeline.Facts);
    }

    public static SearchOutcome Run(
        RunningOrderCostPipeline pipeline,
        UnitLayout layout,
        SearchControl control
    )
    {
        var search = new OrderSearch(pipeline, layout, control);
        search.Seed();
        search.Visit();
        var isCostProven = !search.IsExhausted;
        search.GiveMoreRoomAtTheSameCost();
        if (!isCostProven || search.IsExhausted)
            return new SearchOutcome(search._best, false, search._nodes);

        search.SettleOnTheCanonicalCheapest();

        return new SearchOutcome(search._best, !search.IsExhausted, search._nodes);
    }

    private void Seed()
    {
        var movableOrder = _layout.CurrentOrder.Where(unit => !_layout.IsAnchor(unit)).ToList();
        foreach (var unplaced in _layout.Tray)
            movableOrder = CheapestInsertion(movableOrder, unplaced);

        _best = _layout.Arrange(movableOrder)!;
        _limit = CostOf(_best);
        if (SeededOrder() is { } seeded && CostOf(seeded) < _limit)
        {
            _best = seeded;
            _limit = CostOf(seeded);
        }

        Report();
    }

    private IReadOnlyList<PlanUnit>? SeededOrder()
    {
        var seed = _control.Seed.Distinct().ToList();
        if (seed.Count != _layout.Length)
            return null;

        var rank = seed.Select((key, index) => (key, index))
            .ToDictionary(pair => pair.key, pair => pair.index);
        if (_layout.Movable.Any(unit => !rank.ContainsKey(unit.Lines[0].Key)))
            return null;

        return _layout.Arrange([.. _layout.Movable.OrderBy(unit => rank[unit.Lines[0].Key])]);
    }

    private void Report() => _control.Improved?.Invoke(Solution.KeysOf(_best));

    private void GiveMoreRoomAtTheSameCost()
    {
        _isRoomCounted = true;
        _phaseBudget = _control.NodeBudget;
        _limit = CostOf(_best);
        Visit();
    }

    private void SettleOnTheCanonicalCheapest()
    {
        _isCanonicalPass = true;
        _limit++;
        Visit();
    }

    private List<PlanUnit> CheapestInsertion(
        IReadOnlyList<PlanUnit> movableOrder,
        PlanUnit unplaced
    )
    {
        var cheapest = (Order: new List<PlanUnit>(), Cost: long.MaxValue);
        for (var slot = 0; slot <= movableOrder.Count; slot++)
        {
            var candidate = movableOrder.ToList();
            candidate.Insert(slot, unplaced);
            if (_layout.Arrange(candidate) is not { } arranged)
                continue;

            var cost = CostOf(arranged);
            if (cost < cheapest.Cost)
                cheapest = (candidate, cost);
        }

        return cheapest.Order;
    }

    private long CostOf(IReadOnlyList<PlanUnit> units)
    {
        _cost = _pipeline.BaseCost();
        foreach (var unit in units)
            Choose(unit, Append(unit));

        var cost = _cost;
        while (_chosen.Count > 0)
            Unchoose();

        return cost;
    }

    private void Visit()
    {
        var position = _partial.Count;
        if (position == _layout.Length)
        {
            Accept();
            return;
        }

        foreach (var (unit, bound) in ChildrenAt(position))
        {
            if (bound >= _limit || IsExhausted || _isSettled)
                return;

            Choose(unit, Append(unit));
            Visit();
            Unchoose();
        }
    }

    private void Accept()
    {
        _best = [.. _chosen];
        _limit = _cost;
        _isSettled = _isCanonicalPass;
        Report();
    }

    private IReadOnlyList<(PlanUnit Unit, long Bound)> ChildrenAt(int position)
    {
        IEnumerable<PlanUnit> candidates = _layout.AnchorAt(position) is { } anchor
            ? [anchor]
            : _layout.Movable.Where(unit =>
                !_used[unit.Index] && IsTwinOrderKept(unit) && _layout.Fits(unit, position)
            );
        var children = candidates
            .Select(unit => (Unit: unit, Bound: BoundAfter(unit)))
            .Where(child => child.Bound < _limit);

        return _isCanonicalPass
            ? [.. children.OrderBy(child => child.Unit.FirstActId)]
            : [.. children.OrderBy(child => child.Bound).ThenBy(child => child.Unit.FirstActId)];
    }

    private bool IsTwinOrderKept(PlanUnit unit) =>
        _layout.TwinBefore[unit.Index] is not { } twin || _used[twin.Index];

    private long BoundAfter(PlanUnit unit)
    {
        _nodes++;
        _changeoverBound.Take(unit);
        var added = Append(unit);
        var bound =
            _cost
            + added
            + LexicographicCost.Of(_pipeline.RuleCostCertainAhead(_partial), 0)
            + _changeoverBound.CostAtLeast(
                _partial,
                _layout.Length - _partial.Count,
                _isRoomCounted
            );
        Pop(unit);
        _changeoverBound.Return(unit);

        return bound;
    }

    private void Pop(PlanUnit unit)
    {
        for (var index = 0; index < unit.Lines.Count; index++)
            _partial.Pop();
    }

    private long Append(PlanUnit unit)
    {
        var added = 0L;
        for (var index = 0; index < unit.Lines.Count; index++)
        {
            _partial.Push(unit.Lines[index]);
            added += _pipeline.CostAddedByLastLine(_partial, _isRoomCounted);
        }

        return added;
    }

    private void Choose(PlanUnit unit, long added)
    {
        _cost += added;
        _used[unit.Index] = true;
        _chosen.Add(unit);
        _addedCosts.Add(added);
        _changeoverBound.Take(unit);
    }

    private void Unchoose()
    {
        var unit = _chosen[^1];
        _chosen.RemoveAt(_chosen.Count - 1);
        _used[unit.Index] = false;
        _changeoverBound.Return(unit);
        Pop(unit);
        _cost -= _addedCosts[^1];
        _addedCosts.RemoveAt(_addedCosts.Count - 1);
    }
}
