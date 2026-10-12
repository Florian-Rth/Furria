using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Media;
using Furria.Application.Website;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Website;

public sealed class PublicWebsitePictures
{
    public const string Route = "public/website-pictures/{slotKey}/{position}/{rendition}";

    private const string ApiRoot = "/api/";

    private static readonly FrozenSet<MediaRendition> ServedRenditions = new[]
    {
        MediaRendition.Small,
        MediaRendition.Medium,
        MediaRendition.Large,
    }.ToFrozenSet();

    private readonly PublicFace _publicFace;
    private readonly MediaStore _mediaStore;

    public PublicWebsitePictures(PublicFace publicFace, MediaStore mediaStore)
    {
        _publicFace = publicFace;
        _mediaStore = mediaStore;
    }

    public async Task<IReadOnlyList<PublicWebsitePicture>> ListAsync(CancellationToken ct)
    {
        var rows = await _publicFace
            .WebsitePictures.OrderBy(picture => picture.SlotKey)
            .ThenBy(picture => picture.Position)
            .Select(picture => new PublicPictureRow(
                picture.SlotKey,
                picture.Position,
                picture.Alt,
                picture.MediaItem!.Width ?? 0,
                picture.MediaItem.Height ?? 0,
                picture.MediaItem.Crop
            ))
            .ToListAsync(ct);

        return [.. rows.Select(DetailsOf)];
    }

    public async Task<PublicWebsitePictureFile?> FileAsync(
        PictureSlotPosition slot,
        MediaRendition rendition,
        CancellationToken ct
    )
    {
        if (!ServedRenditions.Contains(rendition))
            return null;

        var shown = await _publicFace
            .WebsitePictures.Where(picture =>
                picture.SlotKey == slot.SlotKey && picture.Position == slot.Position
            )
            .Select(picture => new { picture.MediaItemId, picture.MediaItem!.RenderedAt })
            .SingleOrDefaultAsync(ct);
        if (shown?.RenderedAt is not { } renderedAt)
            return null;

        return await _mediaStore.FileOfAsync(shown.MediaItemId, rendition, ct) is { } file
            ? new PublicWebsitePictureFile
            {
                File = file,
                MediaItemId = shown.MediaItemId,
                RenderedAt = renderedAt,
            }
            : null;
    }

    [Pure]
    public static string UrlOf(PictureSlotPosition slot, MediaRendition rendition) =>
        ApiRoot
        + Route
            .Replace("{slotKey}", slot.SlotKey, StringComparison.Ordinal)
            .Replace(
                "{position}",
                slot.Position.ToString(CultureInfo.InvariantCulture),
                StringComparison.Ordinal
            )
            .Replace("{rendition}", MediaUrlSigner.WireNameOf(rendition), StringComparison.Ordinal);

    [Pure]
    private static PublicWebsitePicture DetailsOf(PublicPictureRow row)
    {
        var slot = new PictureSlotPosition(row.SlotKey, row.Position);
        return new PublicWebsitePicture
        {
            Slot = slot,
            Width = CutLength(row.Width, row.Crop?.Width),
            Height = CutLength(row.Height, row.Crop?.Height),
            Alt = row.Alt,
            Picture = new PictureDetails
            {
                SmallUrl = UrlOf(slot, MediaRendition.Small),
                MediumUrl = UrlOf(slot, MediaRendition.Medium),
                LargeUrl = UrlOf(slot, MediaRendition.Large),
            },
        };
    }

    [Pure]
    private static int CutLength(int length, double? fraction) =>
        (int)Math.Round(length * (fraction ?? 1), MidpointRounding.AwayFromZero);

    private sealed record PublicPictureRow(
        string SlotKey,
        int Position,
        string? Alt,
        int Width,
        int Height,
        MediaCrop? Crop
    );
}
