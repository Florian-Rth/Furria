using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Website;

namespace Furria.Core.Media;

public readonly record struct MediaOwner
{
    private const string GalleryToken = "gallery";
    private const string PersonPrefix = "person:";
    private const string GroupPrefix = "group:";
    private const string NewsPostPrefix = "news:";
    private const string WebsitePrefix = "website:";
    private const string EventPrefix = "event:";
    private const string ActPrefix = "act:";
    private const string SessionPrefix = "session:";

    public const double PortraitAspect = 4.0 / 5;
    public const double GroupPictureAspect = 3.0 / 2;
    public const double NewsPictureAspect = 2.0 / 1;
    public const double EventPictureAspect = 2.0 / 1;

    private static readonly MediaKind[] PhotosOnly = [MediaKind.Photo];
    private static readonly MediaKind[] PhotosAndVideos = [MediaKind.Photo, MediaKind.Video];
    private static readonly MediaKind[] AudioAndVideos = [MediaKind.Audio, MediaKind.Video];

    public MediaOwnerKind Kind { get; }

    public int? Id { get; }

    public PictureSlotPosition? Slot { get; }

    public string Token =>
        Kind switch
        {
            MediaOwnerKind.Person => $"{PersonPrefix}{Id}",
            MediaOwnerKind.Group => $"{GroupPrefix}{Id}",
            MediaOwnerKind.NewsPost => $"{NewsPostPrefix}{Id}",
            MediaOwnerKind.Website => $"{WebsitePrefix}{Slot!.Value.Token}",
            MediaOwnerKind.Event => $"{EventPrefix}{Id}",
            MediaOwnerKind.Act => $"{ActPrefix}{Id}",
            MediaOwnerKind.Session => $"{SessionPrefix}{Id}",
            _ => GalleryToken,
        };

    public IReadOnlyList<MediaKind> AcceptedKinds =>
        Kind switch
        {
            MediaOwnerKind.Gallery => PhotosAndVideos,
            MediaOwnerKind.Act => AudioAndVideos,
            _ => PhotosOnly,
        };

    public bool KeepsSoundProfiles => Kind == MediaOwnerKind.Act;

    public bool KeepsCompactVideos => Kind == MediaOwnerKind.Act;

    public long MaxBytes => AcceptedKinds.Max(MediaLimits.MaxBytesOf);

    public double? PictureAspect =>
        Kind switch
        {
            MediaOwnerKind.Person => PortraitAspect,
            MediaOwnerKind.Group => GroupPictureAspect,
            MediaOwnerKind.NewsPost => NewsPictureAspect,
            MediaOwnerKind.Event => EventPictureAspect,
            _ => null,
        };

    private MediaOwner(MediaOwnerKind kind, int? id, PictureSlotPosition? slot = null)
    {
        Kind = kind;
        Id = id;
        Slot = slot;
    }

    public static MediaOwner Gallery { get; } = new(MediaOwnerKind.Gallery, null);

    public static MediaOwner Person(int personId) => new(MediaOwnerKind.Person, personId);

    public static MediaOwner Group(int groupId) => new(MediaOwnerKind.Group, groupId);

    public static MediaOwner NewsPost(int newsPostId) => new(MediaOwnerKind.NewsPost, newsPostId);

    public static MediaOwner Website(PictureSlotPosition slot) =>
        new(MediaOwnerKind.Website, null, slot);

    public static MediaOwner Event(int eventId) => new(MediaOwnerKind.Event, eventId);

    public static MediaOwner Act(int actId) => new(MediaOwnerKind.Act, actId);

    public static MediaOwner Session(int sessionId) => new(MediaOwnerKind.Session, sessionId);

    public static MediaOwner Of(MediaItem item) =>
        Of(
            item.OwnerKind,
            item.OwnerPersonId,
            item.OwnerGroupId,
            item.OwnerNewsPostId,
            item.OwnerEventId,
            item.OwnerActId,
            item.OwnerSessionId,
            item.WebsitePicture is { } picture
                ? new PictureSlotPosition(picture.SlotKey, picture.Position)
                : null
        );

    public static MediaOwner Of(
        MediaOwnerKind kind,
        int? personId,
        int? groupId,
        int? newsPostId,
        int? eventId,
        int? actId,
        int? sessionId,
        PictureSlotPosition? slot
    ) =>
        kind switch
        {
            MediaOwnerKind.Person => Person(personId!.Value),
            MediaOwnerKind.Group => Group(groupId!.Value),
            MediaOwnerKind.NewsPost => NewsPost(newsPostId!.Value),
            MediaOwnerKind.Website => Website(slot!.Value),
            MediaOwnerKind.Event => Event(eventId!.Value),
            MediaOwnerKind.Act => Act(actId!.Value),
            MediaOwnerKind.Session => Session(sessionId!.Value),
            _ => Gallery,
        };

    [Pure]
    public bool Accepts(MediaKind kind) => AcceptedKinds.Contains(kind);

    [Pure]
    public static MediaOwner? Parse(string? token) =>
        token switch
        {
            GalleryToken => Gallery,
            _ when IdAfter(token, PersonPrefix) is { } personId => Person(personId),
            _ when IdAfter(token, GroupPrefix) is { } groupId => Group(groupId),
            _ when IdAfter(token, NewsPostPrefix) is { } newsPostId => NewsPost(newsPostId),
            _ when IdAfter(token, EventPrefix) is { } eventId => Event(eventId),
            _ when IdAfter(token, ActPrefix) is { } actId => Act(actId),
            _ when IdAfter(token, SessionPrefix) is { } sessionId => Session(sessionId),
            _ when SlotAfter(token) is { } slot => Website(slot),
            _ => null,
        };

    [Pure]
    private static PictureSlotPosition? SlotAfter(string? token) =>
        token is not null && token.StartsWith(WebsitePrefix, StringComparison.Ordinal)
            ? PictureSlotPosition.Parse(token[WebsitePrefix.Length..])
            : null;

    [Pure]
    private static int? IdAfter(string? token, string prefix) =>
        token is not null
        && token.StartsWith(prefix, StringComparison.Ordinal)
        && int.TryParse(
            token.AsSpan(prefix.Length),
            NumberStyles.None,
            CultureInfo.InvariantCulture,
            out var id
        )
        && id > 0
            ? id
            : null;
}
