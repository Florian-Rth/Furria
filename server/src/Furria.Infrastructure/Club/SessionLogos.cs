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
            AspectOf(row.Width, row.Height)
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
        };

    [Pure]
    public static MediaPictureRow PictureRowOf(SessionLogoRow row) =>
        new(row.MediaItemId, row.State, row.RenderedAt, null);

    [Pure]
    private static double? AspectOf(int? width, int? height) =>
        width is { } wide and > 0 && height is { } high and > 0 ? (double)wide / high : null;
}
