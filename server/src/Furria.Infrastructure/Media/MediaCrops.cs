using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;

namespace Furria.Infrastructure.Media;

public static class MediaCrops
{
    [Pure]
    public static MediaCrop ToEntity(PictureCrop crop) =>
        new()
        {
            Left = crop.Left,
            Top = crop.Top,
            Width = crop.Width,
            Height = crop.Height,
        };

    [Pure]
    public static MediaCrop ToEntity(MediaCropDetails crop) =>
        new()
        {
            Left = crop.Left,
            Top = crop.Top,
            Width = crop.Width,
            Height = crop.Height,
        };

    [Pure]
    public static MediaCropDetails ToDetails(MediaCrop crop) =>
        new(crop.Left, crop.Top, crop.Width, crop.Height);
}
