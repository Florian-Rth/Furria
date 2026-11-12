using System.Collections.Frozen;
using Furria.Core.Text;

namespace Furria.Core.News;

public static class NewsText
{
    private static readonly FrozenSet<MentionKind> MentionableKinds =
    [
        MentionKind.Group,
        MentionKind.Person,
    ];

    public static RichTextReading Read(string text) => RichText.Read(text, MentionableKinds);
}
