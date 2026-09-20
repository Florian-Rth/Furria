using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace Furria.Core.Club;

public static partial class SvgSanitizer
{
    private static readonly HashSet<string> BannedElements = new(StringComparer.OrdinalIgnoreCase)
    {
        "script",
        "foreignObject",
    };

    private static readonly HashSet<string> ReferenceAttributes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "href",
        "src",
    };

    private static readonly XmlReaderSettings ReaderSettings = new()
    {
        DtdProcessing = DtdProcessing.Prohibit,
        XmlResolver = null,
    };

    [Pure]
    public static bool TrySanitize(string markup, [NotNullWhen(true)] out string? sanitized)
    {
        if (!TryParse(markup, out var artwork) || !IsSvg(artwork.Root))
        {
            sanitized = null;
            return false;
        }

        Strip(artwork.Root);

        sanitized = artwork.ToString(SaveOptions.DisableFormatting);
        return true;
    }

    private static void Strip(XElement root)
    {
        foreach (var banned in root.DescendantsAndSelf().Where(IsBanned).ToList())
        {
            banned.Remove();
        }

        foreach (var element in root.DescendantsAndSelf())
        {
            foreach (var dangerous in element.Attributes().Where(IsDangerous).ToList())
            {
                dangerous.Remove();
            }
        }
    }

    [Pure]
    private static bool IsSvg([NotNullWhen(true)] XElement? root) =>
        root is not null && root.Name.LocalName.Equals("svg", StringComparison.OrdinalIgnoreCase);

    [Pure]
    private static bool IsBanned(XElement element) =>
        BannedElements.Contains(element.Name.LocalName);

    [Pure]
    private static bool IsDangerous(XAttribute attribute) =>
        IsEventHandler(attribute) || PointsOutsideTheArtwork(attribute);

    [Pure]
    private static bool IsEventHandler(XAttribute attribute) =>
        attribute.Name.LocalName.StartsWith("on", StringComparison.OrdinalIgnoreCase);

    [Pure]
    private static bool PointsOutsideTheArtwork(XAttribute attribute) =>
        (
            ReferenceAttributes.Contains(attribute.Name.LocalName)
            && !StaysInsideTheArtwork(attribute.Value)
        )
        || FunctionalReferencesIn(attribute.Value)
            .Any(reference => !StaysInsideTheArtwork(reference));

    [Pure]
    private static bool StaysInsideTheArtwork(string reference) =>
        reference.TrimStart().StartsWith('#');

    [Pure]
    private static IEnumerable<string> FunctionalReferencesIn(string value) =>
        FunctionalReference().Matches(value).Select(match => match.Groups["target"].Value);

    [GeneratedRegex("""url\(\s*['"]?(?<target>[^'")]*)""", RegexOptions.IgnoreCase)]
    private static partial Regex FunctionalReference();

    [Pure]
    private static bool TryParse(string markup, [NotNullWhen(true)] out XDocument? artwork)
    {
        try
        {
            using var reader = XmlReader.Create(new StringReader(markup), ReaderSettings);
            artwork = XDocument.Load(reader);
            return true;
        }
        catch (XmlException)
        {
            artwork = null;
            return false;
        }
    }
}
