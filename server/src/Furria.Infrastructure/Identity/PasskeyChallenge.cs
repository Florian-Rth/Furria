namespace Furria.Infrastructure.Identity;

public sealed class PasskeyChallenge
{
    public const int IdHashLength = 43;

    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(5);

    public long Id { get; set; }

    public PasskeyChallengePurpose Purpose { get; set; }

    public string IdHash { get; set; } = "";

    public int? AccountId { get; set; }

    public string State { get; set; } = "";

    public DateTimeOffset IssuedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public Account? Account { get; set; }
}
