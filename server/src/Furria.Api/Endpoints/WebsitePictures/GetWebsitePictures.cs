using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Application.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class GetWebsitePictures : EndpointWithoutRequest<GetWebsitePicturesResponse>
{
    private readonly WebsitePictureService _websitePictures;

    public GetWebsitePictures(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Get("website-pictures");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var pictures = await _websitePictures.ListAsync(ct);

        await Send.OkAsync(
            new GetWebsitePicturesResponse { Pictures = [.. pictures.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static WebsitePictureDetailsDto ToDto(WebsitePictureDetails picture) =>
        new()
        {
            Slot = picture.Slot.SlotKey,
            Position = picture.Slot.Position,
            MediaItemId = picture.MediaItemId,
            Aspect = picture.Aspect,
            Alt = picture.Alt,
            Picture = PictureEditingDto.From(picture.Picture)!,
            UpdatedAt = picture.UpdatedAt,
            UpdatedBy = picture.UpdatedBy is { } editor
                ? new WebsitePictureEditorDto
                {
                    PersonId = editor.PersonId,
                    FirstName = editor.FirstName,
                    LastName = editor.LastName,
                }
                : null,
        };
}

public sealed record GetWebsitePicturesResponse
{
    public required IReadOnlyList<WebsitePictureDetailsDto> Pictures { get; init; }
}

public sealed record WebsitePictureDetailsDto
{
    public required string Slot { get; init; }

    public required int Position { get; init; }

    public required int MediaItemId { get; init; }

    public required double Aspect { get; init; }

    public required string? Alt { get; init; }

    public required PictureEditingDto Picture { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required WebsitePictureEditorDto? UpdatedBy { get; init; }
}

public sealed record WebsitePictureEditorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
