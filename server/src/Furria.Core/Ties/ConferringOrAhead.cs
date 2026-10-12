using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;

namespace Furria.Core.Ties;

public static class ConferringOrAhead
{
    [Pure]
    public static Expression<Func<GroupMembership, bool>> GroupMemberships(DateOnly day) =>
        RunningOrAhead.GroupMemberships(day).And(LiveParent.OfGroupMembership);

    [Pure]
    public static Expression<Func<GroupAdmin, bool>> GroupAdmins(DateOnly day) =>
        RunningOrAhead.GroupAdmins(day).And(LiveParent.OfGroupAdmin);

    [Pure]
    public static Expression<Func<RoleHolding, bool>> RoleHoldings(DateOnly day) =>
        RunningOrAhead.RoleHoldings(day).And(LiveParent.OfRoleHolding);

    [Pure]
    public static Expression<Func<BoardSeat, bool>> BoardSeats(DateOnly day) =>
        RunningOrAhead.BoardSeats(day).And(LiveParent.OfBoardSeat);
}
