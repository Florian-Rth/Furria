using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPortraitCropTests : IClassFixture<ApiTestFixture>
{
    private static readonly PictureCrop NewCut = new(0.1, 0.2, 0.4, 0.5);

    private readonly ApiTestFixture _fixture;

    public PutPortraitCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderHerPortraitAnewInTheNewCut_When_SheRecropsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceId = ctx.Identity.People.IdOf("alice");
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var portraitId = await PictureSteps.RenderedPortraitAsync(_fixture, client, aliceId, ct);

        var response = await client.PUTAsync<PutPortraitCrop, PutPortraitCropRequest>(
            RecropOf(aliceId)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(portraitId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(portraitId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_SheHasNoPortraitToRecrop()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await client.PUTAsync<PutPortraitCrop, PutPortraitCropRequest>(
            RecropOf(ctx.Identity.People.IdOf("alice"))
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheRecrop_When_ThePortraitIsAnotherPersonsAndTheCallerMayNotManagePersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddAccount("bernd")),
            ct
        );
        var berndId = ctx.Identity.People.IdOf("bernd");
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ClientForAsync("bernd", ct),
            berndId,
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await client.PUTAsync<PutPortraitCrop, PutPortraitCropRequest>(
            RecropOf(berndId)
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.MediaItem(portraitId).ToBeIn(MediaItemState.Ready).AssertAsync(ct);
    }

    private static PutPortraitCropRequest RecropOf(int personId) =>
        new()
        {
            PersonId = personId,
            Left = NewCut.Left,
            Top = NewCut.Top,
            Width = NewCut.Width,
            Height = NewCut.Height,
        };
}
