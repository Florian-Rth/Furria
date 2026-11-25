using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.Assistant;

public static partial class ClubAssistantText
{
    private const string PersonTargetPrefix = "person:";
    private const string SomeMember = "ein Mitglied";

    [Pure]
    public static string PlainOf(string richText) => InlineToken().Replace(richText, PlainTokenOf);

    [Pure]
    private static string PlainTokenOf(Match token) =>
        token.Groups["escaped"].Success ? token.Groups["escaped"].Value
        : token.Groups["bold"].Success ? ""
        : token.Groups["mention"].Success ? MentionOf(token)
        : $"{LabelOf(token)} ({token.Groups["target"].Value})";

    [Pure]
    private static string MentionOf(Match token) =>
        token.Groups["target"].Value.StartsWith(PersonTargetPrefix, StringComparison.Ordinal)
            ? SomeMember
            : LabelOf(token);

    [Pure]
    private static string LabelOf(Match token) =>
        Escape().Replace(token.Groups["label"].Value, "$1");

    [GeneratedRegex(
        @"\\(?<escaped>[!-/:-@\[-`{-~])|(?<mention>@)?\[(?<label>(?:\\.|[^\]\\])+)\]\((?<target>[^)\s]+)\)|(?<bold>\*\*)"
    )]
    private static partial Regex InlineToken();

    [GeneratedRegex(@"\\([!-/:-@\[-`{-~])")]
    private static partial Regex Escape();
}
