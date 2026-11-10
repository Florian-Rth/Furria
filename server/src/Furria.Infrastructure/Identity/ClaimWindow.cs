using System.Diagnostics.Contracts;
using Furria.Core.Identity;

namespace Furria.Infrastructure.Identity;

public sealed class ClaimWindow
{
    public static readonly TimeSpan LongestOpening = TimeSpan.FromDays(7);

    public int Id { get; set; }

    public DateTimeOffset OpenedAt { get; set; }

    public DateTimeOffset ClosesAt { get; set; }

    public DateTimeOffset? ClosedAt { get; set; }

    public int? OpenedByPersonId { get; set; }

    public Person? OpenedBy { get; set; }

    [Pure]
    public static bool CanCloseAt(DateTimeOffset closesAt, DateTimeOffset now) =>
        closesAt > now && closesAt <= now + LongestOpening;
}
