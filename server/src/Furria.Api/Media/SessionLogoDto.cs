using System.Diagnostics.Contracts;
using Furria.Application.Club;

namespace Furria.Api.Media;

public sealed record SessionLogoDto
{
    public required PictureDto Picture { get; init; }

    public required double Aspect { get; init; }

    [Pure]
    public static SessionLogoDto? From(SessionLogoDetails? logo) =>
        logo is null
            ? null
            : new SessionLogoDto { Picture = PictureDto.From(logo.Picture)!, Aspect = logo.Aspect };
}
