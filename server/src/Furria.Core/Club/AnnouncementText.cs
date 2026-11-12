using System.Collections.Frozen;
using Furria.Core.Text;

namespace Furria.Core.Club;

public static class AnnouncementText
{
    private static readonly FrozenSet<MentionKind> MentionableKinds =
    [
        MentionKind.Group,
        MentionKind.Person,
        MentionKind.CalendarEntry,
        MentionKind.Event,
        MentionKind.NewsPost,
        MentionKind.Album,
    ];

    public static RichTextReading Read(string text) => RichText.Read(text, MentionableKinds);
}
