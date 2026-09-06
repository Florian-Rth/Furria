using Furria.Application.Identity;

namespace Furria.Infrastructure.Identity;

public sealed class RefreshToken
{
    public Guid Id { get; set; }

    public int AccountId { get; set; }

    public string TokenHash { get; set; } = "";

    public Guid FamilyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public RefreshTokenRevocationReason? RevokedReason { get; set; }

    public Guid? ReplacedById { get; set; }

    public Account? Account { get; set; }
}
