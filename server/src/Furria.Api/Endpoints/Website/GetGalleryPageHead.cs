using FastEndpoints;
using FluentValidation;
using Furria.Api.Website;
using Furria.Application.Website;
using Furria.Core.Website;
using Furria.Infrastructure.Gallery;
using Microsoft.Extensions.Options;

namespace Furria.Api.Endpoints.Website;

public sealed class GetGalleryPageHead : Endpoint<GetGalleryPageHeadRequest>
{
    private readonly GalleryService _galleryService;
    private readonly WebsiteOptions _websiteOptions;

    public GetGalleryPageHead(
        GalleryService galleryService,
        IOptions<WebsiteOptions> websiteOptions
    )
    {
        _galleryService = galleryService;
        _websiteOptions = websiteOptions.Value;
    }

    public override void Configure()
    {
        Get("public/page-heads/gallery/{slug}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetGalleryPageHeadRequest req, CancellationToken ct)
    {
        var shown = WebsiteAddress.IdOf(req.Slug) is { } albumId
            ? await _galleryService.GetPublicAlbumAsync(albumId, ct)
            : null;
        if (shown is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.StringAsync(
            PageHeadHtml.Of(PageHeads.Of(shown), _websiteOptions.BaseUrl),
            StatusCodes.Status200OK,
            PageHeadHtml.ContentType,
            ct
        );
    }
}

public sealed record GetGalleryPageHeadRequest
{
    [RouteParam]
    public required string Slug { get; init; }
}

public sealed class GetGalleryPageHeadValidator : Validator<GetGalleryPageHeadRequest>
{
    public GetGalleryPageHeadValidator()
    {
        RuleFor(request => request.Slug).NotEmpty().MaximumLength(WebsiteAddress.MaxSlugLength);
    }
}
