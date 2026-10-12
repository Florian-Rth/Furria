using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Identity;
using Furria.Core.Identity;

namespace Furria.Infrastructure.Registry;

public sealed record MembershipPeriodRow(
    int Id,
    DateOnly StartedOn,
    DateOnly? EndedOn,
    IReadOnlyList<MembershipPauseDetails> Pauses
)
{
    public static readonly Expression<Func<Membership, MembershipPeriodRow>> Projection =
        membership => new MembershipPeriodRow(
            membership.Id,
            membership.StartedOn,
            membership.EndedOn,
            membership
                .Pauses.OrderByDescending(pause => pause.FirstSessionYear)
                .ThenByDescending(pause => pause.Id)
                .Select(pause => new MembershipPauseDetails
                {
                    PauseId = pause.Id,
                    FirstSessionYear = pause.FirstSessionYear,
                    LastSessionYear = pause.LastSessionYear,
                })
                .ToList()
        );

    [Pure]
    public static IReadOnlyList<MembershipDetails> PeriodsOf(
        IReadOnlyList<MembershipPeriodRow> rows,
        DateOnly today
    ) => [.. rows.Select(row => row.ToDetails(today))];

    [Pure]
    public static MembershipChainDetails ChainOf(
        IReadOnlyList<MembershipPeriodRow> rows,
        DateOnly today
    ) => MembershipChainDetails.Of(PeriodsOf(rows, today), today);

    [Pure]
    public MembershipDetails ToDetails(DateOnly today) =>
        MembershipDetails.Of(Id, StartedOn, EndedOn, Pauses, today);
}
