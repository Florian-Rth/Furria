using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class DeleteEventPictureTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteEventPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeThePictureAndItsFilesAway_When_TheKeeperRemovesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EventPictureSeeds.GalaWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var pictureId = await EventPictureSteps.RenderedAsync(_fixture, client, eventId, ct);
        var original = await _fixture.MediaFileOfAsync(pictureId, MediaRendition.Original, ct);

        var response = await client.DELETEAsync<DeleteEventPicture, DeleteEventPictureRequest>(
            new() { EventId = eventId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(pictureId)
            .ToBeGone()
            .Event(eventId)
            .ToShowPicture(null)
            .AssertAsync(ct);
        await _fixture.MediaFilesReapedAsync(ct);
        Assert.False(File.Exists(original));
    }
}
