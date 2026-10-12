using FastEndpoints;
using Furria.Application.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class GetPublicWebsitePictures
    : EndpointWithoutRequest<GetPublicWebsitePicturesResponse>
{
    private readonly PublicWebsitePictures _publicWebsitePictures;

    public GetPublicWebsitePictures(PublicWebsitePictures publicWebsitePictures)
    {
        _publicWebsitePictures = publicWebsitePictures;
    }

    public override void Configure()
    {
        Get("public/website-pictures");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var pictures = await _publicWebsitePictures.ListAsync(ct);

        await Send.OkAsync(
            new GetPublicWebsitePicturesResponse { Pictures = [.. pictures.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static PublicWebsitePictureDto ToDto(PublicWebsitePicture picture) =>
        new()
        {
            Slot = picture.Slot.SlotKey,
            Position = picture.Slot.Position,
            Width = picture.Width,
            Height = picture.Height,
            Alt = picture.Alt,
            SmallUrl = picture.Picture.SmallUrl,
            MediumUrl = picture.Picture.MediumUrl,
            LargeUrl = picture.Picture.LargeUrl,
        };
}

public sealed record GetPublicWebsitePicturesResponse
{
    public required IReadOnlyList<PublicWebsitePictureDto> Pictures { get; init; }
}

public sealed record PublicWebsitePictureDto
{
    public required string Slot { get; init; }

    public required int Position { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string? Alt { get; init; }

    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }
}
