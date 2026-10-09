using System.Diagnostics.Contracts;
using Furria.Core.Media;

namespace Furria.MediaWorker.Photos;

public readonly record struct CropRegion(int Left, int Top, int Width, int Height)
{
    [Pure]
    public static CropRegion Of(PictureCrop crop, int imageWidth, int imageHeight)
    {
        var left = Math.Clamp(Pixel(crop.Left, imageWidth), 0, imageWidth - 1);
        var top = Math.Clamp(Pixel(crop.Top, imageHeight), 0, imageHeight - 1);
        var right = Math.Clamp(Pixel(crop.Left + crop.Width, imageWidth), left + 1, imageWidth);
        var bottom = Math.Clamp(Pixel(crop.Top + crop.Height, imageHeight), top + 1, imageHeight);
        return new CropRegion(left, top, right - left, bottom - top);
    }

    [Pure]
    private static int Pixel(double fraction, int extent) =>
        (int)Math.Round(fraction * extent, MidpointRounding.AwayFromZero);
}
