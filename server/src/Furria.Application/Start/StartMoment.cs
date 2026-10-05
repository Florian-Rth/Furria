using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Start;

public sealed record StartMoment
{
    public required DateTimeOffset Now { get; init; }

    public required DateOnly Today { get; init; }

    [Pure]
    public static StartMoment Of(TimeProvider timeProvider) => At(timeProvider.GetUtcNow());

    [Pure]
    public static StartMoment At(DateTimeOffset now) =>
        new() { Now = now, Today = ClubClock.DayOf(now) };
}
