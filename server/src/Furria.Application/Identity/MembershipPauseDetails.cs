using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Identity;

public sealed record MembershipPauseDetails
{
    public required int PauseId { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int? LastSessionYear { get; init; }

    [Pure]
    public SessionSpan ToSpan() =>
        new() { FirstYear = FirstSessionYear, LastYear = LastSessionYear };
}
