using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.WhatsApp;

public static partial class WhatsAppFormatting
{
    private const string HeadingMarker = "## ";
    private const string ItemMarker = "- ";
    private const string Bullet = "• ";
    private const string PersonTargetPrefix = "person:";
    private const string ContactSuffix = "@c.us";

    private static readonly IReadOnlyDictionary<string, string> InertLookAlikes = new Dictionary<
        string,
        string
    >
    {
        ["*"] = "∗",
        ["_"] = "＿",
        ["~"] = "∼",
        ["`"] = "ˋ",
    };

    [Pure]
    public static string Bold(string text) => $"*{text}*";

    [Pure]
    public static string Italic(string text) => $"_{text}_";

    [Pure]
    public static WhatsAppPostContent FromRichText(
        string text,
        IReadOnlyDictionary<int, string> mentionablePhones
    )
    {
        var mentioned = new List<string>();
        var lines = text.Trim()
            .ReplaceLineEndings("\n")
            .Split('\n')
            .Select(line => LineOf(line, mentionablePhones, mentioned))
            .ToList();

        return new WhatsAppPostContent(string.Join('\n', lines), [.. mentioned.Distinct()]);
    }

    [Pure]
    public static string ChatIdOfPhone(string internationalDigits) =>
        internationalDigits + ContactSuffix;

    private static string LineOf(
        string line,
        IReadOnlyDictionary<int, string> mentionablePhones,
        List<string> mentioned
    )
    {
        if (line.StartsWith(HeadingMarker, StringComparison.Ordinal))
            return Bold(
                InlineOf(line[HeadingMarker.Length..], mentionablePhones, mentioned)
                    .Replace("*", "", StringComparison.Ordinal)
            );

        return line.StartsWith(ItemMarker, StringComparison.Ordinal)
            ? Bullet + InlineOf(line[ItemMarker.Length..], mentionablePhones, mentioned)
            : InlineOf(line, mentionablePhones, mentioned);
    }

    private static string InlineOf(
        string inline,
        IReadOnlyDictionary<int, string> mentionablePhones,
        List<string> mentioned
    ) => InlineToken().Replace(inline, match => TokenOf(match, mentionablePhones, mentioned));

    private static string TokenOf(
        Match match,
        IReadOnlyDictionary<int, string> mentionablePhones,
        List<string> mentioned
    )
    {
        if (match.Groups["escaped"].Success)
            return InertOf(match.Groups["escaped"].Value);
        if (match.Groups["bold"].Success)
            return "*";

        var label = Unescaped(match.Groups["label"].Value);
        var target = match.Groups["target"].Value;
        if (!match.Groups["mention"].Success)
            return label == target ? target : $"{label} ({target})";

        if (PhoneOfMention(target, mentionablePhones) is not { } phone)
            return label;

        mentioned.Add(ChatIdOfPhone(phone));
        return "@" + phone;
    }

    [Pure]
    private static string? PhoneOfMention(
        string target,
        IReadOnlyDictionary<int, string> mentionablePhones
    ) =>
        target.StartsWith(PersonTargetPrefix, StringComparison.Ordinal)
        && int.TryParse(
            target[PersonTargetPrefix.Length..],
            NumberStyles.None,
            CultureInfo.InvariantCulture,
            out var personId
        )
            ? mentionablePhones.GetValueOrDefault(personId)
            : null;

    [Pure]
    private static string Unescaped(string text) =>
        Escape().Replace(text, escaped => InertOf(escaped.Groups[1].Value));

    [Pure]
    private static string InertOf(string character) =>
        InertLookAlikes.GetValueOrDefault(character, character);

    [GeneratedRegex(
        @"\\(?<escaped>[!-/:-@\[-`{-~])|(?<mention>@)?\[(?<label>(?:\\.|[^\]\\])+)\]\((?<target>[^)\s]+)\)|(?<bold>\*\*)"
    )]
    private static partial Regex InlineToken();

    [GeneratedRegex(@"\\([!-/:-@\[-`{-~])")]
    private static partial Regex Escape();
}
