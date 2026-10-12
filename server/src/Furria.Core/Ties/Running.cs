using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Roles;

namespace Furria.Core.Ties;

public static class Running
{
    [Pure]
    public static Expression<Func<Membership, bool>> Memberships(DateOnly day) =>
        membership =>
            membership.StartedOn <= day
            && (membership.EndedOn == null || membership.EndedOn >= day);

    [Pure]
    public static Expression<Func<GroupMembership, bool>> GroupMemberships(DateOnly day) =>
        membership =>
            membership.JoinedOn <= day && (membership.LeftOn == null || membership.LeftOn >= day);

    [Pure]
    public static Expression<Func<GroupAdmin, bool>> GroupAdmins(DateOnly day) =>
        tenure => tenure.SinceOn <= day && (tenure.UntilOn == null || tenure.UntilOn >= day);

    [Pure]
    public static Expression<Func<RoleHolding, bool>> RoleHoldings(DateOnly day) =>
        holding => holding.SinceOn <= day && (holding.UntilOn == null || holding.UntilOn >= day);

    [Pure]
    public static Expression<Func<BoardSeat, bool>> BoardSeats(DateOnly day) =>
        seat => seat.SinceOn <= day && (seat.UntilOn == null || seat.UntilOn >= day);

    [Pure]
    public static Expression<Func<KeyHolding, bool>> KeyHoldings(DateOnly day) =>
        holding => holding.SinceOn <= day && (holding.UntilOn == null || holding.UntilOn >= day);
}
