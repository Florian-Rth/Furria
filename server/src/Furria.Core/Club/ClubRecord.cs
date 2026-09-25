namespace Furria.Core.Club;

public sealed class ClubRecord : ITimestamped
{
    public const int TheOnlyId = 1;
    public const int EarliestFoundedYear = 1800;
    public const int YoungestAgeOfConsent = 12;
    public const int OldestAgeOfConsent = 21;
    public const int DefaultAgeOfConsent = 16;
    public const int NameLength = 160;
    public const int ShortNameLength = 40;
    public const int StreetLength = 120;
    public const int ZipLength = 16;
    public const int CityLength = 80;
    public const int EmailLength = 256;
    public const int PhoneLength = 64;
    public const int LinkLength = 256;

    public int Id { get; set; } = TheOnlyId;

    public string? Name { get; set; }

    public string? ShortName { get; set; }

    public int? FoundedYear { get; set; }

    public string? Street { get; set; }

    public string? Zip { get; set; }

    public string? City { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? InstagramUrl { get; set; }

    public string? FacebookUrl { get; set; }

    public int AgeOfConsent { get; set; } = DefaultAgeOfConsent;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
