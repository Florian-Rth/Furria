using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetNewsPostByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Shown = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Proclaimed = new(2026, 2, 21, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetNewsPostByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowATieAsOffTheWebsite_When_TheAlbumWasUnpublishedSince()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetNewsPostById,
            GetNewsPostByIdRequest,
            GetNewsPostByIdResponse
        >(new() { NewsPostId = ctx.News.Posts.IdOf("stale") });

        Assert.False(result.Content.Album?.IsPublished);
        Assert.Null(result.PendingChanges);
    }

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
                .Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("gala", "Prunksitzung", Gala, "saal")
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "shown",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Shown,
                            coverItemAlias: "cover"
                        )
                        .AddAlbum("hidden", "Probe", sessionStartYear: 2025)
                        .AddGalleryItem("first", albumAlias: "shown", selectionPosition: 1)
                        .AddGalleryItem("cover", albumAlias: "shown", selectionPosition: 2)
                        .AddGalleryItem("unselected", albumAlias: "shown")
                )
                .News(news =>
                    news.AddNewsPost(
                            "review",
                            "Gala-Rückblick",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            authorAlias: NewsSeeds.Editor,
                            eventAlias: "gala",
                            albumAlias: "shown",
                            publishedAt: Proclaimed,
                            slug: "gala-rueckblick"
                        )
                        .AddPendingChanges(
                            "review",
                            "Gala-Rückblick mit Fotos",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            eventAlias: "gala"
                        )
                        .AddNewsPost("stale", "Probe", albumAlias: "hidden")
                        .AddNewsPost(
                            "pictured",
                            "Mit Bild",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Proclaimed,
                            slug: "mit-bild"
                        )
                );
}
