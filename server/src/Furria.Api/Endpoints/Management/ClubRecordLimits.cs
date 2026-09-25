using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Api.Endpoints.Management;

internal static class ClubRecordLimits
{
    internal const int EarliestFoundedYear = ClubRecord.EarliestFoundedYear;
    internal const int LatestFoundedYear = 2100;
    internal const int YoungestAgeOfConsent = ClubRecord.YoungestAgeOfConsent;
    internal const int OldestAgeOfConsent = ClubRecord.OldestAgeOfConsent;

    [Pure]
    internal static bool IsWebLink(string? value) =>
        string.IsNullOrWhiteSpace(value)
        || Uri.TryCreate(value.Trim(), UriKind.Absolute, out var link)
            && (link.Scheme == Uri.UriSchemeHttps || link.Scheme == Uri.UriSchemeHttp);
}
