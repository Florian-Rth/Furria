using Furria.Core.Text;

namespace Furria.Core.Club;

public sealed class AnnouncementMention
{
    public int Id { get; set; }

    public int AnnouncementId { get; set; }

    public MentionKind Kind { get; set; }

    public int TargetId { get; set; }

    public Announcement? Announcement { get; set; }
}
