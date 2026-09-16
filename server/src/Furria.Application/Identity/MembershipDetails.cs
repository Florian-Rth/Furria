using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Identity;

public sealed record MembershipDetails
{
    public required int MembershipId { get; init; }

    public required DateOnly StartedOn { get; init; }

    public required DateOnly? EndedOn { get; init; }

    public required bool IsRunning { get; init; }

    public required bool IsFuture { get; init; }

    public required IReadOnlyList<MembershipPauseDetails> Pauses { get; init; }

    [Pure]
    public static MembershipDetails Of(
        int membershipId,
        DateOnly startedOn,
        DateOnly? endedOn,
        IReadOnlyList<MembershipPauseDetails> pauses,
        DateOnly today
    ) =>
        new()
        {
            MembershipId = membershipId,
            StartedOn = startedOn,
            EndedOn = endedOn,
            IsRunning = new DatePeriod { Start = startedOn, End = endedOn }.IsRunningOn(today),
            IsFuture = startedOn > today,
            Pauses = pauses,
        };

    [Pure]
    public DatePeriod ToPeriod() => new() { Start = StartedOn, End = EndedOn };
}
