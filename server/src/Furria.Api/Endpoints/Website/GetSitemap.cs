using FastEndpoints;
using Furria.Api.Website;
using Furria.Application.Events;
using Furria.Application.Gallery;
using Furria.Application.News;
using Furria.Application.Website;
using Furria.Core.Website;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.News;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.Website;

public sealed class GetSitemap : EndpointWithoutRequest
{
    private static readonly string BrieflyCached = new CacheControlHeaderValue
    {
        Public = true,
        MaxAge = TimeSpan.FromMinutes(5),
    }.ToString();

    private readonly EventService _eventService;
    private readonly NewsService _newsService;
    private readonly GalleryService _galleryService;
    private readonly WebsiteOptions _websiteOptions;

    public GetSitemap(
        EventService eventService,
        NewsService newsService,
        GalleryService galleryService,
        IOptions<WebsiteOptions> websiteOptions
    )
    {
        _eventService = eventService;
        _newsService = newsService;
        _galleryService = galleryService;
        _websiteOptions = websiteOptions.Value;
    }

    public override void Configure()
    {
        Get("public/sitemap.xml");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var events = await _eventService.GetPublicEventsAsync(ct);
        var news = await _newsService.GetPublicNewsAsync(ct);
        var gallery = await _galleryService.GetPublicGalleryAsync(ct);

        HttpContext.Response.Headers.CacheControl = BrieflyCached;
        await Send.StringAsync(
            SitemapXml.Of(EntriesOf(events, news, gallery), _websiteOptions.BaseUrl),
            StatusCodes.Status200OK,
            SitemapXml.ContentType,
            ct
        );
    }

    private static IEnumerable<SitemapEntry> EntriesOf(
        IReadOnlyList<PublicEventSummary> events,
        IReadOnlyList<PublicNewsSection> news,
        IReadOnlyList<PublicGallerySection> gallery
    ) =>
        [
            .. events.Select(shown => new SitemapEntry(
                WebsiteAddress.EventPathOf(shown.EventId, shown.Title),
                shown.ChangedAt
            )),
            .. news.SelectMany(section => section.Posts)
                .Select(post => new SitemapEntry(
                    WebsiteAddress.NewsPathOf(post.Slug),
                    post.ChangedAt
                )),
            .. gallery
                .SelectMany(section => section.Albums)
                .Select(album => new SitemapEntry(
                    WebsiteAddress.AlbumPathOf(album.AlbumId, album.Title),
                    album.ChangedAt
                )),
        ];
}
