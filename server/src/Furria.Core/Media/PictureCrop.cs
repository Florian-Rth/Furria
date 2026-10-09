using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Core.Media;

public readonly record struct PictureCrop(double Left, double Top, double Width, double Height)
{
    private const char Separator = ',';
    private const int Edges = 4;
    private const double EdgeTolerance = 1e-6;

    private static readonly PictureCrop Whole = new(0, 0, 1, 1);

    public string Token =>
        string.Join(
            Separator,
            new[] { Left, Top, Width, Height }.Select(edge =>
                edge.ToString("R", CultureInfo.InvariantCulture)
            )
        );

    [Pure]
    public bool IsCutOfThePicture() =>
        double.IsFinite(Left)
        && double.IsFinite(Top)
        && double.IsFinite(Width)
        && double.IsFinite(Height)
        && Left >= 0
        && Top >= 0
        && Width > 0
        && Height > 0
        && Left + Width <= 1 + EdgeTolerance
        && Top + Height <= 1 + EdgeTolerance;

    [Pure]
    public static PictureCrop Centred(int imageWidth, int imageHeight, double aspect) =>
        Whole.FittedTo(imageWidth, imageHeight, aspect);

    [Pure]
    public PictureCrop FittedTo(int imageWidth, int imageHeight, double aspect)
    {
        var inside = HeldInside();
        var pixelWidth = inside.Width * imageWidth;
        var pixelHeight = inside.Height * imageHeight;

        if (pixelWidth > pixelHeight * aspect)
        {
            var width = pixelHeight * aspect / imageWidth;
            return inside with { Left = inside.Left + (inside.Width - width) / 2, Width = width };
        }

        var height = pixelWidth / aspect / imageHeight;
        return inside with { Top = inside.Top + (inside.Height - height) / 2, Height = height };
    }

    [Pure]
    public static PictureCrop? Parse(string? token)
    {
        var edges = token?.Split(Separator);
        if (edges is not { Length: Edges })
            return null;

        var numbers = new double[Edges];
        for (var index = 0; index < Edges; index++)
            if (
                !double.TryParse(
                    edges[index],
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out numbers[index]
                )
            )
                return null;

        var crop = new PictureCrop(numbers[0], numbers[1], numbers[2], numbers[3]);
        return crop.IsCutOfThePicture() ? crop : null;
    }

    [Pure]
    private PictureCrop HeldInside()
    {
        var left = Math.Clamp(Left, 0, 1);
        var top = Math.Clamp(Top, 0, 1);
        return new PictureCrop(
            left,
            top,
            Math.Clamp(Width, 0, 1 - left),
            Math.Clamp(Height, 0, 1 - top)
        );
    }
}
