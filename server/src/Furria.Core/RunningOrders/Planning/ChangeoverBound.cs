using System.Numerics;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class ChangeoverBound
{
    private readonly IReadOnlyList<PlanLine> _lines;
    private readonly int _words;
    private readonly int[] _remainingByPerson;
    private readonly ulong[] _compatibleByLine;
    private readonly ulong[] _remainingLines;
    private readonly int[][] _personsNeverOnOneLine;

    public ChangeoverBound(PlanFacts facts)
    {
        _lines = facts.Lines;
        _words = (_lines.Count + 63) / 64;
        _remainingByPerson = new int[facts.PersonCount];
        _compatibleByLine = new ulong[_lines.Count * _words];
        _remainingLines = new ulong[_words];
        _personsNeverOnOneLine = PersonsNeverOnOneLine(facts);
        foreach (var line in _lines)
        {
            Count(line, 1);
            foreach (var other in _lines)
            {
                if (other != line && !Casts.Share(line, other))
                    _compatibleByLine[line.Index * _words + other.Index / 64] |= BitOf(other.Index);
            }
        }
    }

    public void Take(PlanUnit unit)
    {
        for (var index = 0; index < unit.Lines.Count; index++)
            Count(unit.Lines[index], -1);
    }

    public void Return(PlanUnit unit)
    {
        for (var index = 0; index < unit.Lines.Count; index++)
            Count(unit.Lines[index], 1);
    }

    public long CostAtLeast(PartialOrder partial, int remainingLines, bool isRoomCounted)
    {
        var last = partial.Count >= 1 ? partial.Last : null;
        var primary = Math.Max(
            PersonCostAtLeast(last, partial.Count >= 2 ? partial.FromEnd(2) : null, remainingLines),
            UnchainableConflictsAtLeast(last) * CostWeights.Conflict
        );

        return LexicographicCost.Of(
            primary,
            isRoomCounted ? RoomAtLeast(partial, remainingLines, primary / CostWeights.Hint) : 0
        );
    }

    private int RoomAtLeast(PartialOrder partial, int remainingLines, int tightGapsAllowed)
    {
        var room = 0;
        foreach (var group in _personsNeverOnOneLine)
            room += GroupRoomAtLeast(group, partial, remainingLines, tightGapsAllowed);

        return room;
    }

    private int GroupRoomAtLeast(
        int[] group,
        PartialOrder partial,
        int remainingLines,
        int tightGapsAllowed
    )
    {
        var pool = new GapPool();
        var (separately, persons, newcomers, appearances) = (0, 0, 0, 0);
        foreach (var person in group)
        {
            var remaining = _remainingByPerson[person];
            if (remaining == 0)
                continue;

            var gaps = new GapPool();
            gaps.AddOpenGaps(remaining - 1);
            if (partial.LastIndexOf(person) is { } lastIndex)
                gaps.AddGapWithAuftritteAlreadyBetween(partial.Count - lastIndex - 1);
            else
                newcomers++;
            persons++;
            appearances += remaining;
            separately += gaps.RoomAtLeast(remainingLines - remaining, tightGapsAllowed);
            pool.Add(gaps);
        }

        var pooledSpare =
            persons * (remainingLines - 1)
            - persons * (persons - 1) / 2
            - newcomers * (newcomers - 1) / 2
            - appearances
            + persons;

        return Math.Max(separately, pool.RoomAtLeast(pooledSpare, tightGapsAllowed));
    }

    private static int[][] PersonsNeverOnOneLine(PlanFacts facts)
    {
        var together = new HashSet<(int, int)>();
        var appearances = new int[facts.PersonCount];
        foreach (var line in facts.Lines)
        {
            foreach (var person in line.PersonSlots)
            {
                appearances[person]++;
                foreach (var other in line.PersonSlots)
                    together.Add((person, other));
            }
        }

        var groups = new List<List<int>>();
        foreach (
            var person in Enumerable
                .Range(0, facts.PersonCount)
                .OrderByDescending(person => appearances[person])
        )
        {
            var group = groups.FirstOrDefault(members =>
                members.All(member => !together.Contains((person, member)))
            );
            if (group is null)
                groups.Add([person]);
            else
                group.Add(person);
        }

        return [.. groups.Select(members => members.ToArray())];
    }

    private int PersonCostAtLeast(PlanLine? last, PlanLine? beforeLast, int remainingLines)
    {
        var atLeast = 0;
        for (var person = 0; person < _remainingByPerson.Length; person++)
        {
            var remaining = _remainingByPerson[person];
            if (remaining == 0)
                continue;

            var cost =
                last?.Has(person) == true ? CostOf(remaining + 1, remainingLines + 1)
                : beforeLast?.Has(person) == true ? CostOf(remaining + 1, remainingLines + 2)
                : CostOf(remaining, remainingLines);
            atLeast = Math.Max(atLeast, cost);
        }

        return atLeast;
    }

    private int UnchainableConflictsAtLeast(PlanLine? last)
    {
        var openEnds = last is null ? 0 : 2 - Math.Min(CompatibleRemaining(last), 1);
        var anyRemaining = false;
        for (var word = 0; word < _words; word++)
        {
            var bits = _remainingLines[word];
            anyRemaining |= bits != 0;
            while (bits != 0)
            {
                var line = _lines[word * 64 + BitOperations.TrailingZeroCount(bits)];
                var neighbours = CompatibleRemaining(line) + (FollowsFreely(last, line) ? 1 : 0);
                openEnds += 2 - Math.Min(neighbours, 2);
                bits &= bits - 1;
            }
        }

        return anyRemaining ? Math.Max(0, (openEnds + 1) / 2 - 1) : 0;
    }

    private static bool FollowsFreely(PlanLine? last, PlanLine line) =>
        last is not null && !Casts.Share(last, line);

    private int CompatibleRemaining(PlanLine line)
    {
        var count = 0;
        for (var word = 0; word < _words; word++)
            count += BitOperations.PopCount(
                _compatibleByLine[line.Index * _words + word] & _remainingLines[word]
            );

        return count;
    }

    private static int CostOf(int appearances, int span)
    {
        var gaps = appearances - 1;
        var shortfall = 3 * appearances - 2 - span;
        if (shortfall <= 0)
            return 0;
        if (shortfall <= gaps)
            return shortfall * CostWeights.Hint;

        var conflicts = shortfall - gaps;
        return conflicts * CostWeights.Conflict + (gaps - conflicts) * CostWeights.Hint;
    }

    private static ulong BitOf(int lineIndex) => 1UL << (lineIndex % 64);

    private void Count(PlanLine line, int delta)
    {
        for (var index = 0; index < line.PersonSlots.Count; index++)
            _remainingByPerson[line.PersonSlots[index]] += delta;
        _remainingLines[line.Index / 64] ^= BitOf(line.Index);
    }
}
