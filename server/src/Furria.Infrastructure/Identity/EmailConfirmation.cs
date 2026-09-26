using Furria.Core.Identity;

namespace Furria.Infrastructure.Identity;

public sealed class EmailConfirmation
{
    public const int CodeHashLength = 43;
    public const int MaxFailedAttempts = 5;

    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(15);

    public long Id { get; set; }

    public EmailConfirmationPurpose Purpose { get; set; }

    public int? InvitationId { get; set; }

    public string NormalizedEmail { get; set; } = "";

    public string CodeHash { get; set; } = "";

    public DateTimeOffset IssuedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public int FailedAttempts { get; set; }

    public DateTimeOffset? ConsumedAt { get; set; }

    public DateTimeOffset? VoidedAt { get; set; }

    public Invitation? Invitation { get; set; }
}
