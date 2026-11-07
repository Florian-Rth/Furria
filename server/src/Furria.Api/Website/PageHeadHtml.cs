using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;
using Furria.Application.Website;
using Furria.Core.Club;

namespace Furria.Api.Website;

public static class PageHeadHtml
{
    public const string ContentType = "text/html; charset=utf-8";

    private const string Marker = "data-page-head";
    private const string TwitterCard = "summary_large_image";
    private const string BerlinIsoFormat = "yyyy-MM-dd'T'HH:mm:sszzz";

    [Pure]
    public static string Of(PageHead head, string websiteBaseUrl)
    {
        var origin = WebsiteOrigin.Of(websiteBaseUrl);
        var canonicalUrl = origin + head.CanonicalPath;

        return string.Join('\n', TagsOf(head, origin, canonicalUrl)) + "\n";
    }

    [Pure]
    private static IEnumerable<string> TagsOf(PageHead head, string origin, string canonicalUrl)
    {
        yield return $"<title {Marker}>{Encoded(head.Title)}</title>";
        yield return NamedMeta("description", head.Description);
        yield return $"<link {Marker} rel=\"canonical\" href=\"{Encoded(canonicalUrl)}\">";
        yield return PropertyMeta("og:url", canonicalUrl);
        yield return PropertyMeta("og:title", head.Title);
        yield return PropertyMeta("og:description", head.Description);
        yield return PropertyMeta("og:type", OpenGraphTypeOf(head.Kind));
        if (head.ImagePath is { } imagePath)
        {
            yield return PropertyMeta("og:image", origin + imagePath);
            yield return PropertyMeta("og:image:alt", head.ImageAlt);
        }

        yield return NamedMeta("twitter:card", TwitterCard);
        if (head.PublishedAt is { } publishedAt)
            yield return PropertyMeta("article:published_time", BerlinIsoOf(publishedAt));
    }

    [Pure]
    private static string OpenGraphTypeOf(PageHeadKind kind) =>
        kind == PageHeadKind.Article ? "article" : "website";

    [Pure]
    private static string BerlinIsoOf(DateTimeOffset instant) =>
        ClubClock.WallClockOf(instant).ToString(BerlinIsoFormat, CultureInfo.InvariantCulture);

    [Pure]
    private static string NamedMeta(string name, string content) =>
        $"<meta {Marker} name=\"{Encoded(name)}\" content=\"{Encoded(content)}\">";

    [Pure]
    private static string PropertyMeta(string property, string content) =>
        $"<meta {Marker} property=\"{Encoded(property)}\" content=\"{Encoded(content)}\">";

    [Pure]
    private static string Encoded(string value)
    {
        var encoded = new StringBuilder(value.Length);
        foreach (var character in value)
        {
            encoded.Append(
                character switch
                {
                    '&' => "&amp;",
                    '<' => "&lt;",
                    '>' => "&gt;",
                    '"' => "&quot;",
                    '\'' => "&#39;",
                    _ => character.ToString(),
                }
            );
        }

        return encoded.ToString();
    }
}
