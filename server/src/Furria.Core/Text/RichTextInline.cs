using System.Diagnostics.Contracts;

namespace Furria.Core.Text;

internal static class RichTextInline
{
    private const string BoldMarker = "**";

    private const string ItalicRefusal = "Kursiv gibt es im Text nicht – nur **fett**.";
    private const string OpenBoldRefusal = "Fett braucht Text und muss wieder geschlossen werden.";
    private const string CodeRefusal = "Code gehört nicht in den Text.";
    private const string HtmlRefusal = "HTML gibt es im Text nicht.";
    private const string ImageRefusal = "Bilder gehören nicht in den Text.";
    private const string LinkRefusal =
        "Ein Link braucht schlichten Text und führt nur auf eine Webadresse mit https:// oder http://.";
    private const string MentionRefusal =
        "Eine Erwähnung braucht einen Namen und zeigt nur auf etwas, das sich hier erwähnen lässt.";

    public static string? RefusalOf(string inline, MentionCollector mentions)
    {
        var boldOpenedAt = -1;
        var index = 0;
        while (index < inline.Length)
        {
            var step = StepAt(inline, index, mentions, ref boldOpenedAt);
            if (step.Refusal is not null)
                return step.Refusal;

            index = step.Next;
        }

        return boldOpenedAt >= 0 ? OpenBoldRefusal : null;
    }

    private static Step StepAt(
        string inline,
        int index,
        MentionCollector mentions,
        ref int boldOpenedAt
    ) =>
        inline[index] switch
        {
            '\\' => Step.To(IsEscape(inline, index) ? index + 2 : index + 1),
            '*' => BoldStepAt(inline, index, ref boldOpenedAt),
            '`' => Step.Refuse(CodeRefusal),
            '<' when OpensTag(inline, index) => Step.Refuse(HtmlRefusal),
            '!' when At(inline, index + 1) == '[' => Step.Refuse(ImageRefusal),
            '@' when At(inline, index + 1) == '[' => MentionStepAt(inline, index + 1, mentions),
            '[' => LinkStepAt(inline, index),
            _ => Step.To(index + 1),
        };

    private static Step BoldStepAt(string inline, int index, ref int boldOpenedAt)
    {
        if (At(inline, index + 1) != '*')
            return Step.Refuse(ItalicRefusal);

        if (boldOpenedAt < 0)
        {
            boldOpenedAt = index + BoldMarker.Length;
            return Step.To(boldOpenedAt);
        }

        if (index == boldOpenedAt)
            return Step.Refuse(OpenBoldRefusal);

        boldOpenedAt = -1;
        return Step.To(index + BoldMarker.Length);
    }

    [Pure]
    private static Step LinkStepAt(string inline, int index) =>
        BracketAt(inline, index) switch
        {
            null => Step.To(index + 1),
            var (label, target, next) => IsPlain(label) && IsWebAddress(target)
                ? Step.To(next)
                : Step.Refuse(LinkRefusal),
        };

    private static Step MentionStepAt(string inline, int index, MentionCollector mentions)
    {
        if (BracketAt(inline, index) is not var (label, target, next))
            return Step.To(index + 1);

        return IsPlain(label) && mentions.TryCollect(target)
            ? Step.To(next)
            : Step.Refuse(MentionRefusal);
    }

    [Pure]
    private static (string Label, string Target, int Next)? BracketAt(string inline, int index)
    {
        var closing = ClosingBracketAfter(inline, index + 1);
        if (closing < 0 || At(inline, closing + 1) != '(')
            return null;

        var end = inline.IndexOf(')', closing + 2);
        return end < 0 ? null : (inline[(index + 1)..closing], inline[(closing + 2)..end], end + 1);
    }

    [Pure]
    private static int ClosingBracketAfter(string inline, int start)
    {
        for (var index = start; index < inline.Length; index++)
        {
            switch (inline[index])
            {
                case '\\' when IsEscape(inline, index):
                    index++;
                    break;
                case '[':
                    return -1;
                case ']':
                    return index;
            }
        }

        return -1;
    }

    [Pure]
    private static bool IsPlain(string label)
    {
        if (string.IsNullOrWhiteSpace(label))
            return false;

        for (var index = 0; index < label.Length; index++)
        {
            if (label[index] == '\\' && IsEscape(label, index))
                index++;
            else if (label[index] is '*' or '`' or '[' or ']' || OpensTag(label, index))
                return false;
        }

        return true;
    }

    [Pure]
    private static bool IsWebAddress(string target) =>
        !target.Any(char.IsWhiteSpace)
        && Uri.TryCreate(target, UriKind.Absolute, out var address)
        && (address.Scheme == Uri.UriSchemeHttps || address.Scheme == Uri.UriSchemeHttp)
        && address.Host.Length > 0;

    [Pure]
    private static bool OpensTag(string text, int index) =>
        text[index] == '<'
        && At(text, index + 1) is { } next
        && (char.IsAsciiLetter(next) || next is '/' or '!' or '?');

    [Pure]
    private static bool IsEscape(string text, int index) =>
        At(text, index + 1) is { } next
        && char.IsAsciiLetterOrDigit(next) is false
        && next is > ' ' and < '\u007f';

    [Pure]
    private static char? At(string text, int index) => index < text.Length ? text[index] : null;

    private readonly record struct Step(int Next, string? Refusal)
    {
        public static Step To(int next) => new(next, null);

        public static Step Refuse(string refusal) => new(0, refusal);
    }
}
