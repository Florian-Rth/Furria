namespace Furria.Core.RunningOrders;

public enum RunningOrderCostStep
{
    NoChangeover = 1,
    TightChangeover = 2,
    MustRules = 3,
    PreferRules = 4,
    SameKind = 5,
    Unplaced = 6,
    ChangeoverRoom = 7,
}
