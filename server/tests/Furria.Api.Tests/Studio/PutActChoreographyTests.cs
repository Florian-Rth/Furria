using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActChoreographyTests : IClassFixture<ApiTestFixture>
{
    private const int Editors = 6;

    private readonly ApiTestFixture _fixture;

    public PutActChoreographyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreTheDocumentAndRaiseTheVersion_When_AnEditorSavesTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 0, 1)]
        );

        var (response, second) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 2.5, 3)]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        var keyframe = Assert.Single(Assert.Single(choreography.Tracks).Keyframes);
        Assert.Equal(
            (first + 1, second, 2.5, 3.0),
            (
                second,
                choreography.Version,
                keyframe.Position.RightMetres,
                keyframe.Position.BackMetres
            )
        );
    }

    [Fact]
    public async Task Should_Refuse_When_TheExpectedVersionIsStale()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 0, 1)]
        );
        await SaveChoreographyAsync(admin, actId, first, [StandingTrack(spotId, march, 1, 1)]);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 2, 1)]
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_ItExpectsNoChoreographyButOneExists()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        await SaveChoreographyAsync(admin, actId, null, [StandingTrack(spotId, march, 0, 1)]);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 1, 1)]
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheDocument_When_ASpotStandsOffTheStage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 6, 1)]
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheDocument_When_ItTracksASpotOfAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var foreignSpot = await AddSpotAsync(admin, otherActId);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(foreignSpot, march, 0, 1)]
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepOneSaveAndRefuseTheOthers_When_EditorsSaveTheSameVersionAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 0, 1)]
        );

        var saves = await Task.WhenAll(
            Enumerable
                .Range(1, Editors)
                .Select(async index =>
                    (
                        RightMetres: index * 0.5,
                        Save: await SaveChoreographyAsync(
                            admin,
                            actId,
                            first,
                            [StandingTrack(spotId, march, index * 0.5, 1)]
                        )
                    )
                )
        );

        var winner = Assert.Single(
            saves,
            save => save.Save.Response.StatusCode == HttpStatusCode.OK
        );
        Assert.All(
            saves.Where(save => save != winner),
            save => Assert.Equal(HttpStatusCode.Conflict, save.Save.Response.StatusCode)
        );
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        var keyframe = Assert.Single(Assert.Single(choreography.Tracks).Keyframes);
        Assert.Equal(
            (winner.Save.Version, winner.RightMetres),
            (choreography.Version, keyframe.Position.RightMetres)
        );
    }

    [Fact]
    public async Task Should_KeepOneSaveAndRefuseTheOthers_When_EditorsSaveTheFirstVersionAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);

        var saves = await Task.WhenAll(
            Enumerable
                .Range(1, Editors)
                .Select(async index =>
                    (
                        RightMetres: index * 0.5,
                        Save: await SaveChoreographyAsync(
                            admin,
                            actId,
                            null,
                            [StandingTrack(spotId, march, index * 0.5, 1)]
                        )
                    )
                )
        );

        var winner = Assert.Single(
            saves,
            save => save.Save.Response.StatusCode == HttpStatusCode.OK
        );
        Assert.All(
            saves.Where(save => save != winner),
            save => Assert.Equal(HttpStatusCode.Conflict, save.Save.Response.StatusCode)
        );
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        var keyframe = Assert.Single(Assert.Single(choreography.Tracks).Keyframes);
        Assert.Equal(
            (winner.Save.Version, winner.RightMetres),
            (choreography.Version, keyframe.Position.RightMetres)
        );
    }
}
