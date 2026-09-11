using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Identity;

public sealed record MembershipChainDetails
{
    private static readonly IReadOnlyList<SessionSpan> NoPauses = [];

    public required MembershipState State { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required MembershipDetails? Current { get; init; }

    public required IReadOnlyList<MembershipDetails> All { get; init; }

    [Pure]
    public static MembershipChainDetails Of(
        IReadOnlyList<MembershipDetails> periods,
        DateOnly today
    )
    {
        var newestFirst = periods
            .OrderByDescending(period => period.StartedOn)
            .ThenByDescending(period => period.MembershipId)
            .ToList();
        var current = newestFirst.FirstOrDefault(period => period.IsRunning);
        var spans = newestFirst.Select(period => period.ToPeriod()).ToList();

        return new MembershipChainDetails
        {
            State = MembershipStateCalculator.Resolve(spans, PausesOf(current), today),
            MemberSince = MembershipStateCalculator.MemberSince(spans, today),
            Current = current,
            All = newestFirst,
        };
    }

    [Pure]
    private static IReadOnlyCollection<SessionSpan> PausesOf(MembershipDetails? current) =>
        current is null
            ? (IReadOnlyCollection<SessionSpan>)NoPauses
            : current.Pauses.Select(pause => pause.ToSpan()).ToList();
}
