using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Infrastructure.Club;

internal static class SessionLogos
{
    public static SessionLogoDetails? LogoOf(MediaPictures pictures, SessionLogoRow row) =>
        (
            pictures.Of(MediaOwner.Session(row.SessionId), row.MediaItemId, row.RenderedAt),
            AspectOf(row)
        )
            is ({ } picture, { } aspect)
            ? new SessionLogoDetails { Picture = picture, Aspect = aspect }
            : null;

    public static SessionLogoEditingDetails EditingOf(
        MediaPictures pictures,
        SessionLogoRow row,
        IReadOnlySet<int> stalledIds
    ) =>
        new()
        {
            State = row.State,
            IsStalled = stalledIds.Contains(row.MediaItemId),
            Logo = LogoOf(pictures, row),
            UncroppedUrl = UncroppedUrlOf(pictures, row),
            Crop = row.Crop is { } crop ? MediaCrops.ToDetails(crop) : null,
        };

    [Pure]
    public static MediaPictureRow PictureRowOf(SessionLogoRow row) =>
        new(row.MediaItemId, row.State, row.RenderedAt, row.Crop);

    private static string? UncroppedUrlOf(MediaPictures pictures, SessionLogoRow row)
    {
        var owner = MediaOwner.Session(row.SessionId);

        return row.Crop is null
            ? pictures.Of(owner, row.MediaItemId, row.RenderedAt)?.MediumUrl
            : pictures.UncroppedUrlOf(owner, row.MediaItemId, row.RenderedAt);
    }

    [Pure]
    private static double? AspectOf(SessionLogoRow row) =>
        row is { Width: { } wide and > 0, Height: { } high and > 0 }
            ? wide * (row.Crop?.Width ?? 1) / (high * (row.Crop?.Height ?? 1))
            : null;
}
