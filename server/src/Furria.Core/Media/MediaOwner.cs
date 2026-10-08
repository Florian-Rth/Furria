using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Core.Media;

public readonly record struct MediaOwner
{
    private const string GalleryToken = "gallery";
    private const string PersonPrefix = "person:";
    private const string GroupPrefix = "group:";

    public MediaOwnerKind Kind { get; }

    public int? Id { get; }

    public string Token =>
        Kind switch
        {
            MediaOwnerKind.Person => $"{PersonPrefix}{Id}",
            MediaOwnerKind.Group => $"{GroupPrefix}{Id}",
            _ => GalleryToken,
        };

    public long MaxBytes =>
        Accepts(MediaKind.Video)
            ? MediaLimits.MaxBytesOf(MediaKind.Video)
            : MediaLimits.MaxBytesOf(MediaKind.Photo);

    private MediaOwner(MediaOwnerKind kind, int? id)
    {
        Kind = kind;
        Id = id;
    }

    public static MediaOwner Gallery { get; } = new(MediaOwnerKind.Gallery, null);

    public static MediaOwner Person(int personId) => new(MediaOwnerKind.Person, personId);

    public static MediaOwner Group(int groupId) => new(MediaOwnerKind.Group, groupId);

    public static MediaOwner Of(MediaItem item) =>
        item.OwnerKind switch
        {
            MediaOwnerKind.Person => Person(item.OwnerPersonId!.Value),
            MediaOwnerKind.Group => Group(item.OwnerGroupId!.Value),
            _ => Gallery,
        };

    [Pure]
    public bool Accepts(MediaKind kind) =>
        Kind == MediaOwnerKind.Gallery || kind == MediaKind.Photo;

    [Pure]
    public static MediaOwner? Parse(string? token) =>
        token switch
        {
            GalleryToken => Gallery,
            _ when IdAfter(token, PersonPrefix) is { } personId => Person(personId),
            _ when IdAfter(token, GroupPrefix) is { } groupId => Group(groupId),
            _ => null,
        };

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
