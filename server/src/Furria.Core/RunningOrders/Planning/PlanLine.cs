namespace Furria.Core.RunningOrders.Planning;

internal sealed class PlanLine
{
    private readonly ulong[] _persons;

    public int Index { get; }

    public LineKey Key { get; }

    public ActKind? ActKind { get; }

    public IReadOnlyList<int> PersonSlots { get; }

    public PlanLine(ReviewLine line, int index, IReadOnlyDictionary<int, int> slotsByPersonId)
    {
        Index = index;
        Key = line.Key;
        ActKind = line.ActKind;
        PersonSlots =
        [
            .. line
                .Cast.Where(member => !member.IsAbsent)
                .Select(member => slotsByPersonId[member.PersonId])
                .Distinct()
                .Order(),
        ];
        _persons = new ulong[(slotsByPersonId.Count + 63) / 64];
        foreach (var slot in PersonSlots)
            _persons[slot / 64] |= 1UL << (slot % 64);
    }

    public bool Has(int personSlot) =>
        (_persons[personSlot / 64] & (1UL << (personSlot % 64))) != 0;

    public bool SharesPersonWith(PlanLine other)
    {
        for (var word = 0; word < _persons.Length; word++)
        {
            if ((_persons[word] & other._persons[word]) != 0)
                return true;
        }

        return false;
    }

    public bool SharesPersonMissingFrom(PlanLine other, PlanLine between)
    {
        for (var word = 0; word < _persons.Length; word++)
        {
            if ((_persons[word] & other._persons[word] & ~between._persons[word]) != 0)
                return true;
        }

        return false;
    }
}
