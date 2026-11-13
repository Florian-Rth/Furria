using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;

namespace Furria.Core.Text;

public static partial class RichText
{
    private const string HeadingMarker = "## ";
    private const string ItemMarker = "- ";

    private const string HeadingLevelRefusal =
        "Der Text kennt nur eine Ebene Zwischenüberschriften („## “).";
    private const string QuoteRefusal = "Zitate gibt es im Text nicht.";
    private const string ListRefusal =
        "Listen im Text sind einfache Aufzählungen mit „- “, ohne Nummern und ohne Ebenen.";
    private const string CodeRefusal = "Eingerückter Text und Code gehören nicht in den Text.";
    private const string RuleRefusal = "Trennlinien gibt es im Text nicht.";
    private const string EmptyBlockRefusal =
        "Eine Zwischenüberschrift oder ein Punkt braucht Text.";

    private static readonly RichTextReading Empty = new(null, []);

    public static RichTextReading Read(string text, IReadOnlySet<MentionKind> mentionableKinds)
    {
        var mentions = new MentionCollector(mentionableKinds);
        foreach (var line in text.ReplaceLineEndings("\n").Split('\n'))
        {
            var refusal = LineRefusalOf(line) ?? RichTextInline.RefusalOf(InlineOf(line), mentions);
            if (refusal is not null)
                return new RichTextReading(refusal, []);
        }

        var found = mentions.Distinct();
        return found.Count == 0 ? Empty : new RichTextReading(null, found);
    }

    [Pure]
    private static string InlineOf(string line) =>
        line.StartsWith(HeadingMarker, StringComparison.Ordinal) ? line[HeadingMarker.Length..]
        : line.StartsWith(ItemMarker, StringComparison.Ordinal) ? line[ItemMarker.Length..]
        : line;

    [Pure]
    private static string? LineRefusalOf(string line) =>
        line.Length == 0 ? null
        : char.IsWhiteSpace(line[0]) ? IndentRefusalOf(line)
        : IsEmptyBlock(line) ? EmptyBlockRefusal
        : line.StartsWith('#') && !line.StartsWith(HeadingMarker, StringComparison.Ordinal)
            ? HeadingLevelRefusal
        : line.StartsWith('>') ? QuoteRefusal
        : ThematicBreak().IsMatch(line) || SetextUnderline().IsMatch(line) ? RuleRefusal
        : OtherListMarker().IsMatch(line) ? ListRefusal
        : CodeFence().IsMatch(line) ? CodeRefusal
        : null;

    [Pure]
    private static string? IndentRefusalOf(string line) =>
        string.IsNullOrWhiteSpace(line) ? null
        : line.TrimStart().StartsWith(ItemMarker, StringComparison.Ordinal) ? ListRefusal
        : CodeRefusal;

    [Pure]
    private static bool IsEmptyBlock(string line) =>
        line.TrimEnd() is "-" or "##" || line is HeadingMarker or ItemMarker;

    [GeneratedRegex(@"^(?:[-*_]\s*){3,}$")]
    private static partial Regex ThematicBreak();

    [GeneratedRegex(@"^=+\s*$")]
    private static partial Regex SetextUnderline();

    [GeneratedRegex(@"^(?:[*+]\s|\d{1,9}[.)](?:\s|$))")]
    private static partial Regex OtherListMarker();

    [GeneratedRegex(@"^(?:```|~~~)")]
    private static partial Regex CodeFence();
}
