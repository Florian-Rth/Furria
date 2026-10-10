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
    public async Task Should_ShowTheLiveVersionBesideItsPendingChanges_When_APublishedPostIsOpened()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetNewsPostById,
            GetNewsPostByIdRequest,
            GetNewsPostByIdResponse
        >(new() { NewsPostId = ctx.News.Posts.IdOf("review") });

        Assert.Equal(NewsPostState.Published, result.State);
        Assert.Equal("gala-rueckblick", result.Slug);
        Assert.Equal("Gala-Rückblick", result.Content.Title);
        Assert.Equal("Prunksitzung", result.Content.Event?.Title);
        Assert.Equal(Gala, result.Content.Event?.StartsAt);
        Assert.Equal("Bürgerhaus", result.Content.Event?.VenueName);
        Assert.Equal("Prunksitzung", result.Content.Album?.Title);
        Assert.True(result.Content.Album?.IsPublished);
        Assert.Equal(2, result.Content.Album?.PhotoCount);
        Assert.StartsWith(
            _fixture.SignedMediaUrl(
                ctx.Gallery.Items.IdOf("cover"),
                MediaOwner.Gallery,
                MediaRendition.Medium
            ),
            result.Content.Album?.Cover?.MediumUrl
        );
        Assert.Equal("Gala-Rückblick mit Fotos", result.PendingChanges?.Title);
        Assert.Null(result.PendingChanges?.Album);
        Assert.Equal("Nele", result.Author?.FirstName);
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

    [Fact]
    public async Task Should_ShowTheLivePictureBesideThePendingOne_When_APublishedPostHasANewPicture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var postId = ctx.News.Posts.IdOf("pictured");
        var livePictureId = await NewsPictureSteps.LivePictureAsync(client, postId, ct);
        await _fixture.RenderMediaItemDirectlyAsync(livePictureId, ct);
        var pendingPictureId = await NewsPictureSteps.UploadAsync(client, postId, ct);

        var (_, result) = await client.GETAsync<
            GetNewsPostById,
            GetNewsPostByIdRequest,
            GetNewsPostByIdResponse
        >(new() { NewsPostId = postId });

        var live = Assert.IsType<PictureEditingDto>(result.Content.Picture);
        Assert.Equal(MediaItemState.Ready, live.State);
        Assert.StartsWith(
            _fixture.SignedMediaUrl(
                livePictureId,
                MediaOwner.NewsPost(postId),
                MediaRendition.Medium
            ),
            live.Picture?.MediumUrl
        );
        Assert.NotNull(live.UncroppedUrl);
        var pending = Assert.IsType<PictureEditingDto>(result.PendingChanges?.Picture);
        Assert.Equal(MediaItemState.Processing, pending.State);
        Assert.Null(pending.Picture);
        Assert.NotEqual(livePictureId, pendingPictureId);
    }

    [Fact]
    public async Task Should_NameWhoSavedLast_When_APostIsOpened()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var editor = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var postId = ctx.News.Posts.IdOf("pictured");
        await NewsPictureSteps.UploadAsync(editor, postId, ct);

        var (_, result) = await editor.GETAsync<
            GetNewsPostById,
            GetNewsPostByIdRequest,
            GetNewsPostByIdResponse
        >(new() { NewsPostId = postId });

        Assert.Equal("Nele", result.LastSavedBy?.FirstName);
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
