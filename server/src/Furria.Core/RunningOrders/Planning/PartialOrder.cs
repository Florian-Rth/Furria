using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class PartialOrder
{
    private const int Unplaced = -1;

    private readonly PlanFacts _facts;
    private readonly PlanLine[] _lines;
    private readonly int[] _indexes;
    private readonly int[] _lastIndexByPerson;
    private readonly int[] _shadowedLastIndexes;
    private int _shadowCount;

    public int Count { get; private set; }

    public PlanLine Last => _lines[Count - 1];

    public PartialOrder(PlanFacts facts)
    {
        _facts = facts;
        _lines = new PlanLine[facts.Lines.Count];
        _indexes = new int[facts.Lines.Count];
        _lastIndexByPerson = new int[facts.PersonCount];
        _shadowedLastIndexes = new int[facts.Lines.Sum(line => line.PersonSlots.Count)];
        Array.Fill(_indexes, Unplaced);
        Array.Fill(_lastIndexByPerson, Unplaced);
    }

    public void Push(PlanLine line)
    {
        for (var index = 0; index < line.PersonSlots.Count; index++)
        {
            var slot = line.PersonSlots[index];
            _shadowedLastIndexes[_shadowCount++] = _lastIndexByPerson[slot];
            _lastIndexByPerson[slot] = Count;
        }

        _indexes[line.Index] = Count;
        _lines[Count++] = line;
    }

    public void Pop()
    {
        var line = _lines[--Count];
        _indexes[line.Index] = Unplaced;
        for (var index = line.PersonSlots.Count - 1; index >= 0; index--)
            _lastIndexByPerson[line.PersonSlots[index]] = _shadowedLastIndexes[--_shadowCount];
    }

    [Pure]
    public PlanLine FromEnd(int back) => _lines[Count - back];

    [Pure]
    public bool Places(PlanLine line) => _indexes[line.Index] != Unplaced;

    [Pure]
    public bool Places(LineKey key) => _facts.FindLine(key) is { } line && Places(line);

    [Pure]
    public int IndexOf(LineKey key) => _indexes[_facts.LineOf(key).Index];

    [Pure]
    public int? LastIndexOf(int personSlot) =>
        _lastIndexByPerson[personSlot] is var index and not Unplaced ? index : null;

    [Pure]
    public int? EarlierIndexOfLastLinePerson(int personNumberInLastLine)
    {
        var shadowed = _shadowedLastIndexes[
            _shadowCount - Last.PersonSlots.Count + personNumberInLastLine
        ];

        return shadowed == Unplaced ? null : shadowed;
    }
}
