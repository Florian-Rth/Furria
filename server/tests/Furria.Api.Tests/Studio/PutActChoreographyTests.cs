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
    public async Task Should_KeepBothChanges_When_TwoEditorsChangeOtherSpotsOfTheSameVersion()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var front = await AddSpotAsync(admin, actId);
        var back = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [TrackAt(front, march, (1, 0)), TrackAt(back, march, (1, 1))]
        );
        await SaveChoreographyAsync(admin, actId, first, [TrackAt(front, march, (1, -2))]);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [TrackAt(back, march, (1, 1), (2, 3))]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(
            [(front, -2.0), (back, 1.0), (back, 3.0)],
            choreography.Tracks.SelectMany(track =>
                track.Keyframes.Select(keyframe => (track.SpotId, keyframe.Position.RightMetres))
            )
        );
    }

    [Fact]
    public async Task Should_KeepEveryChange_When_EditorsSaveOtherSpotsOfTheSameVersionAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        int[] spots =
        [
            await AddSpotAsync(admin, actId),
            await AddSpotAsync(admin, actId),
            await AddSpotAsync(admin, actId),
        ];
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [.. spots.Select(spotId => TrackAt(spotId, march, (1, 0)))]
        );

        var saves = await Task.WhenAll(
            spots.Select(spotId =>
                SaveChoreographyAsync(admin, actId, first, [TrackAt(spotId, march, (1, 2))])
            )
        );

        Assert.All(saves, save => Assert.Equal(HttpStatusCode.OK, save.Response.StatusCode));
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.All(
            choreography.Tracks,
            track => Assert.Equal(2.0, track.Keyframes.Single().Position.RightMetres)
        );
    }

    [Fact]
    public async Task Should_KeepTheVersion_When_TheSaveChangesNothing()
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

        var (response, version) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 0, 1)]
        );

        Assert.Equal((HttpStatusCode.OK, first), (response.StatusCode, version));
    }

    [Fact]
    public async Task Should_KeepBothChanges_When_TwoEditorsChangeOtherKeyframesOfOneSpot()
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
            [TrackAt(spotId, march, (1, 0), (3, 0))]
        );
        await SaveChoreographyAsync(admin, actId, first, [TrackAt(spotId, march, (1, 2), (3, 0))]);

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [TrackAt(spotId, march, (1, 0), (2, 4), (3, 0))]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var track = (await StudioOfAsync(admin, actId)).Studio!.Choreography!.Tracks.Single();
        Assert.Equal(
            [(1.0, 2.0), (2.0, 4.0), (3.0, 0.0)],
            track.Keyframes.Select(keyframe => (keyframe.Seconds, keyframe.Position.RightMetres))
        );
    }

    [Fact]
    public async Task Should_NameTheOverlapAndKeepTheOtherSave_When_BothEditorsMovedTheSameKeyframe()
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
        var (_, second) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 1, 1)]
        );

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 2, 1)]
        );

        var overlap = Assert.Single((await OverlapConflictOf(response)).Overlaps);
        var keyframe = Assert.Single(overlap.Keyframes);
        Assert.Equal(
            (spotId, march, 1.0),
            (overlap.SpotId, keyframe.SourceMediaItemId, keyframe.Seconds)
        );
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(
            (second, 1.0),
            (
                choreography.Version,
                choreography.Tracks.Single().Keyframes.Single().Position.RightMetres
            )
        );
    }

    [Fact]
    public async Task Should_Refuse_When_TheBaseVersionIsUnknown()
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

        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            first + 1,
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
