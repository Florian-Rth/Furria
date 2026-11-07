using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Media;

namespace Furria.Api.Media;

public sealed record SessionLogoEditingDto
{
    public required MediaItemState State { get; init; }

    public required bool IsStalled { get; init; }

    public required SessionLogoDto? Logo { get; init; }

    public required string? UncroppedUrl { get; init; }

    public required PictureCropDto? Crop { get; init; }

    [Pure]
    public static SessionLogoEditingDto? From(SessionLogoEditingDetails? editing) =>
        editing is null
            ? null
            : new SessionLogoEditingDto
            {
                State = editing.State,
                IsStalled = editing.IsStalled,
                Logo = SessionLogoDto.From(editing.Logo),
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
