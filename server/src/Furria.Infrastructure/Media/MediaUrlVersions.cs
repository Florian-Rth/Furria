using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Infrastructure.Media;

public static class MediaUrlVersions
{
    [Pure]
    public static string Versioned(string url, DateTimeOffset? renderedAt) =>
        renderedAt is { } rendered
            ? $"{url}{(url.Contains('?', StringComparison.Ordinal) ? '&' : '?')}v={rendered.ToUnixTimeMilliseconds().ToString(CultureInfo.InvariantCulture)}"
            : url;
}
