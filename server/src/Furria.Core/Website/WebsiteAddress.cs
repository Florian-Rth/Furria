using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Furria.Core.Text;

namespace Furria.Core.Website;

public static partial class WebsiteAddress
{
    public const int MaxSlugLength = 512;

    private const char Separator = '-';
    private const char FirstCombiningMark = '̀';
    private const char LastCombiningMark = 'ͯ';

    [Pure]
    public static string EventPathOf(int eventId, string title) =>
        $"/events/{IdSlugOf(eventId, title)}";

    [Pure]
    public static string AlbumPathOf(int albumId, string title) =>
        $"/gallery/{IdSlugOf(albumId, title)}";

    [Pure]
    public static string NewsPathOf(string slug) => $"/news/{slug}";

    [Pure]
    public static string IdSlugOf(int id, string title)
    {
        var titleSlug = TitleSlugOf(title);
        var idText = id.ToString(CultureInfo.InvariantCulture);

        return titleSlug.Length == 0 ? idText : $"{idText}{Separator}{titleSlug}";
    }

    [Pure]
    public static int? IdOf(string slug) =>
        LeadingId().Match(slug) is { Success: true } match
        && int.TryParse(match.Groups[1].Value, CultureInfo.InvariantCulture, out var id)
        && id > 0
            ? id
            : null;

    [Pure]
    private static string TitleSlugOf(string title) =>
        NonSlugRuns()
            .Replace(WithoutCombiningMarks(GermanFold.Expand(title)), Separator.ToString())
            .Trim(Separator);

    [Pure]
    private static string WithoutCombiningMarks(string value)
    {
        var decomposed = value.Normalize(NormalizationForm.FormD);
        var stripped = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            if (character is < FirstCombiningMark or > LastCombiningMark)
                stripped.Append(character);
        }

        return stripped.ToString();
    }

    [GeneratedRegex("^([0-9]+)(?:-|\\z)", RegexOptions.CultureInvariant)]
    private static partial Regex LeadingId();

    [GeneratedRegex("[^a-z0-9]+", RegexOptions.CultureInvariant)]
    private static partial Regex NonSlugRuns();
}
