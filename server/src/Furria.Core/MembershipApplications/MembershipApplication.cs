using System.Diagnostics.Contracts;

namespace Furria.Core.MembershipApplications;

public sealed class MembershipApplication
{
    public const int NameLength = 80;
    public const int StreetLength = 120;
    public const int ZipLength = 5;
    public const int CityLength = 80;
    public const int EmailLength = 254;
    public const int PhoneLength = 31;
    public const int TokenHashLength = 43;

    public static readonly TimeSpan ConfirmationWindow = TimeSpan.FromHours(48);

    public int Id { get; set; }

    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public DateOnly BirthDate { get; set; }

    public string Street { get; set; } = "";

    public string Zip { get; set; } = "";

    public string City { get; set; } = "";

    public string Email { get; set; } = "";

    public string? Phone { get; set; }

    public string ConfirmationTokenHash { get; set; } = "";

    public DateTimeOffset SubmittedAt { get; set; }

    public DateTimeOffset? ConfirmedAt { get; set; }

    [Pure]
    public static DateTimeOffset ConfirmableSince(DateTimeOffset now) => now - ConfirmationWindow;
}
