namespace Furria.Core.RunningOrders;

public enum RunningOrderShapeProblem
{
    DuplicateAct = 1,
    PositionsNotDense = 2,
    PinnedLineUnplaced = 3,
    BlockMemberUnplaced = 4,
    BlockNotContiguous = 5,
    RuleShapeInvalid = 6,
    RuleSubjectMissing = 7,
}
