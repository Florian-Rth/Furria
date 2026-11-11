using System.Diagnostics.Contracts;

namespace Furria.Application.GroupMatcher;

public static class StatementStates
{
    [Pure]
    public static GroupStatementState Of(
        DateTimeOffset? stanceTakenAt,
        DateTimeOffset approvedAt,
        DateTimeOffset? rewordedAt,
        DateTimeOffset? groupJoinedAt
    ) =>
        stanceTakenAt switch
        {
            null when groupJoinedAt < approvedAt => GroupStatementState.New,
            null => GroupStatementState.Open,
            _ when rewordedAt > stanceTakenAt => GroupStatementState.Changed,
            _ => GroupStatementState.Answered,
        };

    [Pure]
    public static bool NeedsAttention(GroupStatementState state) =>
        state is not GroupStatementState.Answered;
}
