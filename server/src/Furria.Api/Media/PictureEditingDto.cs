using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;

namespace Furria.Api.Media;

public sealed record PictureEditingDto
{
    public required MediaItemState State { get; init; }

    public required PictureDto? Picture { get; init; }

    public required string? UncroppedUrl { get; init; }

    public required PictureCropDto? Crop { get; init; }

    [Pure]
    public static PictureEditingDto? From(PictureEditingDetails? editing) =>
        editing is null
            ? null
            : new PictureEditingDto
            {
                State = editing.State,
                Picture = PictureDto.From(editing.Picture),
                UncroppedUrl = editing.UncroppedUrl,
                Crop = editing.Crop is { } crop
                    ? new PictureCropDto
                    {
                        Left = crop.Left,
                        Top = crop.Top,
                        Width = crop.Width,
                        Height = crop.Height,
                    }
                    : null,
            };
}

public sealed record PictureCropDto
{
    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}
