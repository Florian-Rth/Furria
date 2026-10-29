namespace Furria.Core.RunningOrders;

public enum FindingKind
{
    NoChangeover = 1,
    TightChangeover = 2,
    MustRuleBroken = 3,
    PreferRuleMissed = 4,
    SameKindAdjacent = 5,
    NobodyThere = 6,
    Absences = 7,
    Unplaced = 8,
}
