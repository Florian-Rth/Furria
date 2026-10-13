using System.Net;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class EventPictureUploadTests : IClassFixture<ApiTestFixture>
{
    private const int PictureLength = 4096;

    private readonly ApiTestFixture _fixture;

    public EventPictureUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BecomeTheEventsPicture_When_TheKeeperUploadsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);

        var pictureId = await EventPictureSteps.UploadAsync(client, eventId, ct);

        await ctx
            .Expected.MediaItem(pictureId)
            .ToBeOwnedBy(MediaOwner.Event(eventId))
            .MediaItem(pictureId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .Event(eventId)
            .ToShowPicture(pictureId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteTheFormerPicture_When_TheEventGetsANewOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var formerId = await EventPictureSteps.UploadAsync(client, eventId, ct);

        var pictureId = await EventPictureSteps.UploadAsync(client, eventId, ct);

        await ctx
            .Expected.Event(eventId)
            .ToShowPicture(pictureId)
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheCallerMayNotManageEvents()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Member, ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.EventOwner(ctx.Club.Events.IdOf(EventPictureSeeds.Gala)),
            "gala.jpg",
            PictureLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.EventOwner(ctx.Club.CalendarEntries.IdOf(EventPictureSeeds.Meeting)),
            "gala.jpg",
            PictureLength,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectAVideo_When_ItIsMeantAsTheEventsPicture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var video = MediaSamples.Mp4(PictureLength);
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            TusUploadSteps.EventOwner(ctx.Club.Events.IdOf(EventPictureSeeds.Gala)),
            "gala.mp4",
            video.Length,
            ct
        );

        var response = await TusUploadSteps.PatchAsync(client, upload, 0, video, ct);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }
}
