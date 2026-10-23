using System.Diagnostics.Contracts;

namespace Furria.Application.RunningOrders;

public sealed class ActScope
{
    public static readonly ActScope Everything = new(null);

    public IReadOnlyList<int>? GroupIds { get; }

    private ActScope(IReadOnlyList<int>? groupIds)
    {
        GroupIds = groupIds;
    }

    [Pure]
    public static ActScope OfGroups(IReadOnlyList<int> groupIds) => new(groupIds);

    [Pure]
    public bool Covers(int? groupId) =>
        GroupIds is null || (groupId is { } id && GroupIds.Contains(id));

    [Pure]
    public bool AllowsEditing(int? currentGroupId, int? editedGroupId) =>
        GroupIds is null || (Covers(currentGroupId) && currentGroupId == editedGroupId);
}
