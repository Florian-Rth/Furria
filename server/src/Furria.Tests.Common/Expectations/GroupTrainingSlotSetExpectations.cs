namespace Furria.Tests.Common.Expectations;

public sealed class GroupTrainingSlotSetExpectations
{
    internal Expected Expected { get; }

    internal int GroupId { get; }

    internal GroupTrainingSlotSetExpectations(Expected expected, int groupId)
    {
        Expected = expected;
        GroupId = groupId;
    }
}
