using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Api.Endpoints.Groups;
using Furria.Api.Endpoints.News;
using Furria.Api.Tests.News;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Public;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class GetPublicPictureTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] MediumRendition = [4, 8, 15, 16, 23, 42];
    private static readonly DateOnly SeatedIn2023 = new(2023, 11, 11);
    private static readonly DateTimeOffset Published = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetPublicPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeTheBoardPortraitUncachedByTheEdge_When_ItsHolderSitsInAPublicOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var portraitId = await SeatedPortraitAsync(untilOn: null, ct);

        var response = await GetAsync(PublicPictureKind.BoardPortrait, portraitId, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheBoardPortraitsHolderHasLeftThePublicOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var portraitId = await SeatedPortraitAsync(untilOn: _fixture.Today, ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(2),
            async () =>
            {
                var response = await GetAsync(PublicPictureKind.BoardPortrait, portraitId, ct);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ServeTheGroupPicture_When_TheGroupIsShownPublicly()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, pictureId) = await GroupPictureAsync(ct);

        var response = await GetAsync(PublicPictureKind.GroupPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheGroupOfThePictureIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, pictureId) = await GroupPictureAsync(ct);
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
        );

        var response = await GetAsync(PublicPictureKind.GroupPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ServeTheGalleryPhoto_When_ItIsInThePublicSelection()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryAsync(ct);

        var response = await GetAsync(
            PublicPictures.PhotoOf(ctx.Gallery.Items.IdOf("finale"), renderedAt: null).MediumUrl,
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheAlbumOfTheGalleryPhotoIsUnpublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryAsync(ct);
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.DELETEAsync<UnpublishGalleryAlbum, UnpublishGalleryAlbumRequest>(
            new() { AlbumId = ctx.Gallery.Albums.IdOf("gala") }
        );

        var response = await GetAsync(
            PublicPictures.PhotoOf(ctx.Gallery.Items.IdOf("finale"), renderedAt: null).MediumUrl,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ServeTheNewsPicture_When_ItsPostIsShownPublicly()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, pictureId) = await NewsPictureAsync(ct);

        var response = await GetAsync(PublicPictureKind.NewsPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePostOfTheNewsPictureIsWithdrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, pictureId) = await NewsPictureAsync(ct);
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.DELETEAsync<WithdrawNewsPost, WithdrawNewsPostRequest>(
            new() { NewsPostId = ctx.News.Posts.IdOf("live") }
        );

        var response = await GetAsync(PublicPictureKind.NewsPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePublishedPostOfTheNewsPictureIsNotShownPublicly()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, pictureId) = await NewsPictureAsync(ct);
        await _fixture.UncategorizeNewsPostDirectlyAsync(ctx.News.Posts.IdOf("live"), ct);

        var response = await GetAsync(PublicPictureKind.NewsPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheNewsPictureIsOnlyPending()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LivePost(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.UploadAsync(client, ctx.News.Posts.IdOf("live"), ct),
            ct
        );

        var response = await GetAsync(PublicPictureKind.NewsPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePictureIsAskedUnderAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, pictureId) = await GroupPictureAsync(ct);

        var response = await GetAsync(PublicPictureKind.NewsPicture, pictureId, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData("original")]
    [InlineData("uncropped")]
    public async Task Should_AnswerNotFound_When_ARenditionBeyondTheCutIsAsked(string rendition)
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, pictureId) = await GroupPictureAsync(ct);
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Original, [1, 2, 3], ct);
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Uncropped, [9, 9], ct);
        var url = MediumUrlOf(PublicPictureKind.GroupPicture, pictureId)
            .Replace("/medium?", $"/{rendition}?", StringComparison.Ordinal);

        var response = await GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ServeTheRequestedRange_When_ARangeIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, pictureId) = await GroupPictureAsync(ct);
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            MediumUrlOf(PublicPictureKind.GroupPicture, pictureId)
        );
        request.Headers.Range = new System.Net.Http.Headers.RangeHeaderValue(2, 4);

        var response = await _fixture.CreateClient().SendAsync(request, ct);

        Assert.Equal(HttpStatusCode.PartialContent, response.StatusCode);
        Assert.Equal(MediumRendition[2..5], await response.Content.ReadAsByteArrayAsync(ct));
    }

    private Task<HttpResponseMessage> GetAsync(
        PublicPictureKind kind,
        int pictureId,
        CancellationToken ct
    ) => GetAsync(MediumUrlOf(kind, pictureId), ct);

    private Task<HttpResponseMessage> GetAsync(string url, CancellationToken ct) =>
        _fixture.CreateClient().GetAsync(url, ct);

    private string MediumUrlOf(PublicPictureKind kind, int pictureId) =>
        PublicPictures.Of(kind, pictureId, _fixture.TimeProvider.GetUtcNow())!.MediumUrl;

    private async Task<int> SeatedPortraitAsync(DateOnly? untilOn, CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("nadine", "Nadine", "Wolters"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                            .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023, untilOn)
                    ),
            ct
        );
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Identity.People.IdOf("nadine"),
            ct
        );
        await _fixture.PlaceRenditionAsync(portraitId, MediaRendition.Medium, MediumRendition, ct);
        return portraitId;
    }

    private async Task<(SeededContext Ctx, int PictureId)> GroupPictureAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var pictureId = await PictureSteps.RenderedGroupPictureAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ct
        );
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Medium, MediumRendition, ct);
        return (ctx, pictureId);
    }

    private async Task<SeededContext> GalleryAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "gala",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Published
                        )
                        .AddGalleryItem("finale", albumAlias: "gala", selectionPosition: 1)
                ),
            ct
        );
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("finale"),
            MediaRendition.Medium,
            MediumRendition,
            ct
        );
        return ctx;
    }

    private async Task<(SeededContext Ctx, int PictureId)> NewsPictureAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(LivePost(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.LivePictureAsync(client, ctx.News.Posts.IdOf("live"), ct),
            ct
        );
        return (ctx, pictureId);
    }

    private async Task<int> RenderedAsync(int pictureId, CancellationToken ct)
    {
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Medium, MediumRendition, ct);
        return pictureId;
    }

    private static Action<SeedContextBuilder> LivePost() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost(
                    "live",
                    "Prunksitzung",
                    "Vorspann",
                    "Text",
                    NewsCategory.Session,
                    publishedAt: Published,
                    slug: "prunksitzung"
                )
            );
}
