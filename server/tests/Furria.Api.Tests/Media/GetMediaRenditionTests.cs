using System.Net;
using System.Net.Http.Headers;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class GetMediaRenditionTests : IClassFixture<ApiTestFixture>
{
    private const string FileName = "Prunksitzung 042.jpg";
    private const int PhotoLength = 4096;

    private static readonly DateTimeOffset EarlyInASigningWeek = new(
        2026,
        10,
        8,
        1,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetMediaRenditionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeTheOriginal_When_TheUrlIsSigned()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, photo) = await GalleryPhotoAsync(ct);
        var url = _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Original);

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/jpeg", response.Content.Headers.ContentType?.MediaType);
        Assert.Null(response.Content.Headers.ContentDisposition);
        Assert.Equal(photo, await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_ServeTheRequestedRange_When_ARangeIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, photo) = await GalleryPhotoAsync(ct);
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Original)
        );
        request.Headers.Range = new RangeHeaderValue(100, 199);

        var response = await _fixture.CreateClient().SendAsync(request, ct);

        Assert.Equal(HttpStatusCode.PartialContent, response.StatusCode);
        Assert.Equal(photo[100..200], await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_OfferTheOriginalFileName_When_ADownloadIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Original);

        var response = await _fixture.CreateClient().GetAsync($"{url}&download", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("attachment", response.Content.Headers.ContentDisposition?.DispositionType);
        Assert.Equal(FileName, response.Content.Headers.ContentDisposition?.FileNameStar);
    }

    [Fact]
    public async Task Should_ServeTheRendition_When_TheWorkerHasMadeIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        byte[] rendition = [.. "RIFF"u8, 0, 0, 0, 0, .. "WEBP"u8];
        await _fixture.PlaceRenditionAsync(mediaItemId, MediaRendition.Medium, rendition, ct);
        var url = _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Medium);

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/webp", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(rendition, await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheRenditionIsNotMadeYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Medium);

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheItemIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Original);
        await _fixture.DeleteMediaItemDirectlyAsync(mediaItemId, ct);

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUrl_When_ItWasSignedForAnotherRendition()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var smallUrl = _fixture.SignedMediaUrl(
            mediaItemId,
            MediaOwner.Gallery,
            MediaRendition.Small
        );

        var response = await _fixture
            .CreateClient()
            .GetAsync(smallUrl.Replace("/small?", "/original?", StringComparison.Ordinal), ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUrl_When_ItWasSignedForAnotherOwner()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = _fixture.SignedMediaUrl(
            mediaItemId,
            MediaOwner.Group(mediaItemId),
            MediaRendition.Original
        );

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_LetTheBrowserKeepTheFileUntilTheUrlExpires_When_TheUrlIsServed()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = await SignedAtAsync(EarlyInASigningWeek, mediaItemId);
        CacheControlHeaderValue? cacheControl = null;

        await _fixture.AtInstantAsync(
            EarlyInASigningWeek,
            async () =>
                cacheControl = (await _fixture.CreateClient().GetAsync(url, ct))
                    .Headers
                    .CacheControl
        );

        Assert.Equal(
            (true, true, TimeSpan.FromDays(14) - TimeSpan.FromHours(1)),
            (cacheControl?.Private, cacheControl?.Extensions.Any(IsImmutable), cacheControl?.MaxAge)
        );
    }

    [Fact]
    public async Task Should_StillServeTheUrl_When_TheWeekAfterItsSigningIsNotOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = await SignedAtAsync(EarlyInASigningWeek, mediaItemId);

        var status = await StatusAtAsync(
            EarlyInASigningWeek.AddDays(13).AddHours(22).AddMinutes(59),
            url,
            ct
        );

        Assert.Equal(HttpStatusCode.OK, status);
    }

    [Fact]
    public async Task Should_RefuseTheUrl_When_TheWeekAfterItsSigningIsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);
        var url = await SignedAtAsync(EarlyInASigningWeek, mediaItemId);

        var status = await StatusAtAsync(EarlyInASigningWeek.AddDays(13).AddHours(23), url, ct);

        Assert.Equal(HttpStatusCode.Forbidden, status);
    }

    [Fact]
    public async Task Should_IssueTheSameUrl_When_SignedTwiceInOneWeek()
    {
        var ct = TestContext.Current.CancellationToken;
        var (mediaItemId, _) = await GalleryPhotoAsync(ct);

        var firstDay = await SignedAtAsync(EarlyInASigningWeek, mediaItemId);
        var weekEnd = await SignedAtAsync(EarlyInASigningWeek.AddDays(6).AddHours(22), mediaItemId);
        var nextWeek = await SignedAtAsync(
            EarlyInASigningWeek.AddDays(6).AddHours(23),
            mediaItemId
        );

        Assert.Equal(firstDay, weekEnd);
        Assert.NotEqual(firstDay, nextWeek);
    }

    private static bool IsImmutable(NameValueHeaderValue directive) =>
        directive.Name == "immutable";

    private async Task<string> SignedAtAsync(DateTimeOffset instant, int mediaItemId)
    {
        var url = "";
        await _fixture.AtInstantAsync(
            instant,
            () =>
            {
                url = _fixture.SignedMediaUrl(
                    mediaItemId,
                    MediaOwner.Gallery,
                    MediaRendition.Original
                );
                return Task.CompletedTask;
            }
        );
        return url;
    }

    private async Task<HttpStatusCode> StatusAtAsync(
        DateTimeOffset instant,
        string url,
        CancellationToken ct
    )
    {
        var status = HttpStatusCode.InternalServerError;
        await _fixture.AtInstantAsync(
            instant,
            async () => status = (await _fixture.CreateClient().GetAsync(url, ct)).StatusCode
        );
        return status;
    }

    private async Task<(int MediaItemId, byte[] Photo)> GalleryPhotoAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "galerie",
                            "ilka-galerie",
                            "Galerie",
                            "ilka",
                            FurriaPermissions.GalleryUpload
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var photo = MediaSamples.Jpeg(PhotoLength);

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            FileName,
            photo,
            PhotoLength,
            ct
        );
        return (mediaItemId, photo);
    }
}
