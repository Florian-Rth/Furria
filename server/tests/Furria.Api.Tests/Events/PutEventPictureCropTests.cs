using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PutEventPictureCropTests : IClassFixture<ApiTestFixture>
{
    private static readonly PictureCrop NewCut = new(0, 0.2, 1, 0.4);

    private readonly ApiTestFixture _fixture;

    public PutEventPictureCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderThePictureAnewInTheNewCut_When_TheKeeperRecropsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var pictureId = await EventPictureSteps.RenderedAsync(_fixture, client, eventId, ct);

        var response = await client.PUTAsync<PutEventPictureCrop, PutEventPictureCropRequest>(
            RecropOf(eventId)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(pictureId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(pictureId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .Event(eventId)
            .ToShowPicture(pictureId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheEventHasNoPicture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);

        var response = await client.PUTAsync<PutEventPictureCrop, PutEventPictureCropRequest>(
            RecropOf(ctx.Club.Events.IdOf(EventPictureSeeds.Gala))
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static PutEventPictureCropRequest RecropOf(int eventId) =>
        new()
        {
            EventId = eventId,
            Left = NewCut.Left,
            Top = NewCut.Top,
            Width = NewCut.Width,
            Height = NewCut.Height,
        };
}
