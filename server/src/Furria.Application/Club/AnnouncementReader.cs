namespace Furria.Application.Club;

public sealed record AnnouncementReader(
    int AccountId,
    MentionReader Mentions,
    bool MayPostAnnouncements
);
