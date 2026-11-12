using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Core.Text;

internal static class MentionTarget
{
    private const char Separator = ':';

    private static readonly FrozenDictionary<string, MentionKind> KindsByPrefix = new Dictionary<
        string,
        MentionKind
    >
    {
        ["group"] = MentionKind.Group,
        ["person"] = MentionKind.Person,
        ["calendar-entry"] = MentionKind.CalendarEntry,
        ["event"] = MentionKind.Event,
        ["news-post"] = MentionKind.NewsPost,
        ["album"] = MentionKind.Album,
    }.ToFrozenDictionary(StringComparer.Ordinal);

    [Pure]
    public static Mention? MentionOf(string target, IReadOnlySet<MentionKind> mentionableKinds)
    {
        var separatorAt = target.IndexOf(Separator, StringComparison.Ordinal);
        if (separatorAt < 0 || !KindsByPrefix.TryGetValue(target[..separatorAt], out var kind))
            return null;

        return mentionableKinds.Contains(kind)
            ? MentionOf(kind, target[(separatorAt + 1)..])
            : null;
    }

    [Pure]
    private static Mention? MentionOf(MentionKind kind, string id) =>
        id.All(char.IsAsciiDigit)
        && int.TryParse(id, NumberStyles.None, CultureInfo.InvariantCulture, out var targetId)
        && targetId > 0
            ? new Mention(kind, targetId)
            : null;
}
