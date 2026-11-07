using System.Net;
using System.Xml.Linq;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class GetSitemapTests : IClassFixture<ApiTestFixture>
{
    private const string Origin = ApiTestFixture.WebsiteBaseUrl;

    private static readonly XNamespace Sitemap = "http://www.sitemaps.org/schemas/sitemap/0.9";
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetSitemapTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListOnlyWhatTheWebsiteShows_When_TheSitemapIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(_fixture.TimeProvider.GetUtcNow()), ct);

        var response = await _fixture.CreateClient().GetAsync("/api/public/sitemap.xml", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var urls = XDocument
            .Parse(await response.Content.ReadAsStringAsync(ct))
            .Root!.Elements(Sitemap + "url")
            .ToList();
        Assert.Equal(
            [
                $"{Origin}/events/{ctx.Club.Events.IdOf("ball")}-kinderball",
                $"{Origin}/news/motto-verkuendet",
                $"{Origin}/gallery/{ctx.Gallery.Albums.IdOf("gala")}-prunksitzung",
            ],
            urls.Select(url => url.Element(Sitemap + "loc")!.Value)
        );
        Assert.All(urls, url => Assert.NotNull(url.Element(Sitemap + "lastmod")));
    }

    private static Action<SeedContextBuilder> Club(DateTimeOffset now) =>
        builder =>
            builder
                .Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("ball", "Kinderball", now.AddDays(30), "saal")
                        .AddEvent("hidden", "Probe", now.AddDays(30), "saal", unpublished: true)
                        .AddEvent("over", "Altweiber", now.AddDays(-30), "saal")
                )
                .News(news =>
                    news.AddNewsPost(
                            "motto",
                            "Motto verkündet",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            publishedAt: Published,
                            slug: "motto-verkuendet"
                        )
                        .AddNewsPost("draft", "Entwurf", "Vorspann", "Text", NewsCategory.Club)
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "gala",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Published
                        )
                        .AddGalleryItem("chosen", albumAlias: "gala", selectionPosition: 1)
                        .AddAlbum("draft", "Probe", sessionStartYear: 2025)
                        .AddGalleryItem("draft-chosen", albumAlias: "draft", selectionPosition: 1)
                        .AddAlbum("empty", "Leer", sessionStartYear: 2025, publishedAt: Published)
                );
}
