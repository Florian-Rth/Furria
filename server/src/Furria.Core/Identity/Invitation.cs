using System.Diagnostics.Contracts;

namespace Furria.Core.Identity;

public sealed class Invitation
{
    public const int TokenHashLength = 43;

    public static readonly TimeSpan MailLifetime = TimeSpan.FromDays(14);

    public int Id { get; set; }

    public int PersonId { get; set; }

    public InvitationPurpose Purpose { get; set; }

    public InvitationChannel Channel { get; set; }

    public string TokenHash { get; set; } = "";

    public string? CodeHash { get; set; }

    public int? IssuedByPersonId { get; set; }

    public DateTimeOffset IssuedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RedeemedAt { get; set; }

    public DateTimeOffset? VoidedAt { get; set; }

    public bool IsReminder { get; set; }

    public Person? Person { get; set; }

    public Person? IssuedBy { get; set; }

    [Pure]
    public static bool IsExpiredAt(DateTimeOffset expiresAt, DateTimeOffset instant) =>
        expiresAt <= instant;
}
