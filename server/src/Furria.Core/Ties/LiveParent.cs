using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;

namespace Furria.Core.Ties;

internal static class LiveParent
{
    public static readonly Expression<Func<GroupMembership, bool>> OfGroupMembership = membership =>
        membership.Group!.ArchivedOn == null;

    public static readonly Expression<Func<GroupAdmin, bool>> OfGroupAdmin = tenure =>
        tenure.Group!.ArchivedOn == null;

    public static readonly Expression<Func<RoleHolding, bool>> OfRoleHolding = holding =>
        holding.Role!.ArchivedOn == null;

    public static readonly Expression<Func<BoardSeat, bool>> OfBoardSeat = seat =>
        seat.BoardOffice!.ArchivedOn == null;

    public static readonly Expression<Func<BoardSeat, bool>> OfBoardSeatRole = seat =>
        seat.BoardOffice!.ImpliedRoleId != null
        && seat.BoardOffice!.ImpliedRole!.ArchivedOn == null;

    public static readonly Expression<Func<KeyHolding, bool>> OfKeyHolding = holding =>
        holding.Venue!.ArchivedOn == null;
}
