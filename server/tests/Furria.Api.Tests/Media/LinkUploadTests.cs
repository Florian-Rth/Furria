using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class LinkUploadTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 4096;

    private readonly ApiTestFixture _fixture;

    public LinkUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LandInTheLinksOwnInbox_When_AGuestUploadsAPhotoThroughTheLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var photo = MediaSamples.Jpeg(2 * ChunkLength + 5);

        await LinkUploadSteps.UploadAsync(
            _fixture.CreateClient(),
            ctx.Gallery.UploadLinkTokens.IdOf("zug"),
            "IMG_0042.jpg",
            photo,
            ChunkLength,
            ct,
            "  Oma Gerda "
        );

        var manager = await ctx.Identity.ClientForAsync("jana", ct);
        var linkId = ctx.Gallery.UploadLinks.IdOf("zug");
        var item = Assert.Single((await InboxOfAsync(manager, linkId)).Items);
        Assert.Equal("Oma Gerda", item.UploaderName);
        await ctx
            .Expected.MediaItem(item.MediaItemId)
            .ToBeOwnedBy(MediaOwner.UploadLink(linkId))
            .MediaItem(item.MediaItemId)
            .ToBeUploadedAs(null, "IMG_0042.jpg", photo.Length)
            .MediaItem(item.MediaItemId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
        var (_, listed) = await manager.GETAsync<GetUploadLinks, GetUploadLinksResponse>();
        Assert.Equal(1, Assert.Single(listed.Links).UploadCount);
    }

    [Fact]
    public async Task Should_AcceptAVideo_When_AGuestUploadsItThroughTheLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );

        await LinkUploadSteps.UploadAsync(
            _fixture.CreateClient(),
            ctx.Gallery.UploadLinkTokens.IdOf("zug"),
            "Einmarsch.mov",
            MediaSamples.Mp4(ChunkLength),
            ChunkLength,
            ct
        );

        var manager = await ctx.Identity.ClientForAsync("jana", ct);
        var item = Assert.Single(
            (await InboxOfAsync(manager, ctx.Gallery.UploadLinks.IdOf("zug"))).Items
        );
        Assert.Equal(MediaKind.Video, item.Kind);
        Assert.Null(item.UploaderName);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_NoTokenComesWithIt()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Photographer(), ct);

        var response = await LinkUploadSteps.CreateAsync(
            _fixture.CreateClient(),
            null,
            "foto.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheTokenIsNotOneTheClubHandedOut()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Photographer(gallery => gallery.AddUploadLink("zug", "Zug")), ct);

        var response = await LinkUploadSteps.CreateAsync(
            _fixture.CreateClient(),
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "foto.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseANewUpload_When_TheLinkHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        HttpResponseMessage? response = null;

        await _fixture.AtLaterTimeAsync(
            UploadLink.Lifetime,
            async () =>
                response = await LinkUploadSteps.CreateAsync(
                    _fixture.CreateClient(),
                    token,
                    "foto.jpg",
                    ChunkLength,
                    ct
                )
        );

        Assert.Equal(HttpStatusCode.Gone, response?.StatusCode);
    }

    [Fact]
    public async Task Should_LetAStartedUploadFinish_When_TheLinkExpiresMidway()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        var guest = _fixture.CreateClient();
        var photo = MediaSamples.Jpeg(ChunkLength);
        var upload = await LinkUploadSteps.CreatedAsync(guest, token, "a.jpg", photo.Length, ct);
        HttpResponseMessage? response = null;

        await _fixture.AtLaterTimeAsync(
            UploadLink.Lifetime,
            async () =>
                response = await LinkUploadSteps.PatchAsync(guest, token, upload, 0, photo, ct)
        );

        Assert.Equal(HttpStatusCode.NoContent, response?.StatusCode);
    }

    [Fact]
    public async Task Should_HideAnUploadFromAnotherLink_When_ItsTokenTriesToContinueIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery.AddUploadLink("zug", "Zug").AddUploadLink("ball", "Ball")
            ),
            ct
        );
        var guest = _fixture.CreateClient();
        var upload = await LinkUploadSteps.CreatedAsync(
            guest,
            ctx.Gallery.UploadLinkTokens.IdOf("zug"),
            "a.jpg",
            ChunkLength,
            ct
        );

        var response = await LinkUploadSteps.HeadAsync(
            guest,
            ctx.Gallery.UploadLinkTokens.IdOf("ball"),
            upload,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_HideALinkUploadFromMembers_When_TheyTryToContinueItAsTheirOwn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var upload = await LinkUploadSteps.CreatedAsync(
            _fixture.CreateClient(),
            ctx.Gallery.UploadLinkTokens.IdOf("zug"),
            "a.jpg",
            ChunkLength,
            ct
        );
        var member = await ctx.Identity.ClientForAsync("jana", ct);
        var memberPath = new Uri(
            upload
                .ToString()
                .Replace(LinkUploads.UrlPath, MediaUploads.UrlPath, StringComparison.Ordinal),
            UriKind.RelativeOrAbsolute
        );

        var response = await TusUploadSteps.HeadAsync(member, memberPath, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_ItIsNeitherPhotoNorVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        var guest = _fixture.CreateClient();
        var upload = await LinkUploadSteps.CreatedAsync(guest, token, "song.wav", ChunkLength, ct);

        var response = await LinkUploadSteps.PatchAsync(
            guest,
            token,
            upload,
            0,
            MediaSamples.Wav(ChunkLength),
            ct
        );

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_APhotoExceedsThePhotoLimit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        var guest = _fixture.CreateClient();
        var upload = await LinkUploadSteps.CreatedAsync(
            guest,
            token,
            "huge.jpg",
            MediaLimits.MaxPhotoBytes + 1,
            ct
        );

        var response = await LinkUploadSteps.PatchAsync(
            guest,
            token,
            upload,
            0,
            MediaSamples.Jpeg(ChunkLength),
            ct
        );

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheLinkHasTakenAllItHolds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery.AddUploadLink("zug", "Zug", uploadedBytes: UploadLink.MaxBytes - 10)
            ),
            ct
        );

        var response = await LinkUploadSteps.CreateAsync(
            _fixture.CreateClient(),
            ctx.Gallery.UploadLinkTokens.IdOf("zug"),
            "a.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
    }

    private static async Task<GetUploadLinkInboxResponse> InboxOfAsync(
        HttpClient manager,
        int uploadLinkId
    )
    {
        var (_, inbox) = await manager.GETAsync<
            GetUploadLinkInbox,
            GetUploadLinkInboxRequest,
            GetUploadLinkInboxResponse
        >(new() { UploadLinkId = uploadLinkId });
        return inbox;
    }

    private static Action<SeedContextBuilder> Photographer(
        Action<GallerySeedBuilder>? gallery = null
    ) =>
        builder =>
            builder
                .Gallery(gallery ?? (_ => { }))
                .Identity(identity => identity.AddAccount("jana").AddAccount("markus"))
                .Roles(roles =>
                    roles
                        .AddRoleWithHolder(
                            "fotografie",
                            "fotografie-holding",
                            "Fotografie",
                            "jana",
                            FurriaPermissions.GalleryManage
                        )
                        .AddRoleWithHolder(
                            "galerie",
                            "galerie-holding",
                            "Galerie",
                            "markus",
                            FurriaPermissions.GalleryUpload
                        )
                );
}
