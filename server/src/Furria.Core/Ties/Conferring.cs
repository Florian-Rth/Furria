using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;

namespace Furria.Core.Ties;

public static class Conferring
{
    [Pure]
    public static Expression<Func<GroupMembership, bool>> GroupMemberships(DateOnly day) =>
        Running.GroupMemberships(day).And(LiveParent.OfGroupMembership);

    [Pure]
    public static Expression<Func<GroupAdmin, bool>> GroupAdmins(DateOnly day) =>
        Running.GroupAdmins(day).And(LiveParent.OfGroupAdmin);

    [Pure]
    public static Expression<Func<RoleHolding, bool>> RoleHoldings(DateOnly day) =>
        Running.RoleHoldings(day).And(LiveParent.OfRoleHolding);

    [Pure]
    public static Expression<Func<BoardSeat, bool>> BoardSeats(DateOnly day) =>
        Running.BoardSeats(day).And(LiveParent.OfBoardSeat);

    [Pure]
    public static Expression<Func<BoardSeat, bool>> BoardSeatRoles(DateOnly day) =>
        BoardSeats(day).And(LiveParent.OfBoardSeatRole);

    [Pure]
    public static Expression<Func<KeyHolding, bool>> KeyHoldings(DateOnly day) =>
        Running.KeyHoldings(day).And(LiveParent.OfKeyHolding);
}
