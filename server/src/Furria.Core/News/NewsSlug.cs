using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;
using Furria.Core.Text;

namespace Furria.Core.News;

public static class NewsSlug
{
    public const int MaxLength = 80;

    private const string Fallback = "meldung";
    private const char Separator = '-';

    [Pure]
    public static string Of(string title)
    {
        var joined = Joined(GermanFold.Strip(GermanFold.Expand(title)));
        var cut = joined.Length <= MaxLength ? joined : AtWordBoundary(joined);

        return cut.Length == 0 ? Fallback : cut;
    }

    [Pure]
    public static string FirstFreeOf(string slug, IReadOnlyCollection<string> taken) =>
        taken.Contains(slug)
            ? Enumerable
                .Range(2, taken.Count)
                .Select(number => Numbered(slug, number))
                .First(candidate => !taken.Contains(candidate))
            : slug;

    [Pure]
    private static string Numbered(string slug, int number) =>
        string.Create(CultureInfo.InvariantCulture, $"{slug}{Separator}{number}");

    [Pure]
    private static string Joined(string folded)
    {
        var joined = new StringBuilder(folded.Length);
        foreach (var character in folded)
        {
            if (char.IsAsciiLetterOrDigit(character))
                joined.Append(character);
            else if (joined.Length > 0 && joined[^1] != Separator)
                joined.Append(Separator);
        }

        return joined.ToString().TrimEnd(Separator);
    }

    [Pure]
    private static string AtWordBoundary(string joined)
    {
        var head = joined[..(MaxLength + 1)];
        var boundary = head.LastIndexOf(Separator);

        return boundary > 0 ? head[..boundary] : joined[..MaxLength];
    }
}
