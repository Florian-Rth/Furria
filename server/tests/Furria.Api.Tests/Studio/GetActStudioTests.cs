using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetActStudioTests : IClassFixture<ApiTestFixture>
{
    private const string StageArtwork =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 21 14\">"
        + "<rect width=\"21\" height=\"14\" />"
        + "</svg>";

    private readonly ApiTestFixture _fixture;

    public GetActStudioTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_GiveEachPlacedEveningItsPosition_When_ACastMemberOpensTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var actId = await GardetanzAsync(ctx, ct);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, gala, null, [Line(rede, 0), Line(actId, 1)]);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var evening = Assert.Single(
            (await StudioOfAsync(anna, actId)).Studio!.Evenings,
            evening => evening.EventId == gala
        );

        Assert.Equal(1, evening.Appearance?.Position);
    }

    [Fact]
    public async Task Should_OpenTheStudioReadOnly_When_ACastMemberOpensTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.Equal("Gardetanz", studio.Act.Name);
        Assert.Equal(
            (true, false, false, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
        Assert.Equal(0, studio.Studio.Music.LengthSeconds);
        Assert.Empty(studio.Studio.Songs);
        Assert.Null(studio.Studio.Stage);
    }

    [Fact]
    public async Task Should_DrawOurStage_When_TheClubHasSetItUp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                GardeWithDancers(_fixture.Today)(builder);
                builder.Club(club =>
                    club.SetClubRecord(stage: new ClubStageIntent(10.5m, 7m, StageArtwork))
                );
            },
            ct
        );
        var actId = await GardetanzAsync(ctx, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.NotNull(studio.Studio);
        Assert.Equal(
            new StudioStageDto
            {
                WidthMetres = 10.5,
                DepthMetres = 7,
                ArtworkSvg = StageArtwork,
            },
            studio.Studio.Stage
        );
    }

    [Fact]
    public async Task Should_ShowTheActWithoutTheStudio_When_APlannerOpensIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);

        var studio = await StudioOfAsync(planner, actId);

        Assert.Equal(
            (false, true, false, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.Null(studio.Studio);
        Assert.Empty(studio.CoEditors);
    }

    [Fact]
    public async Task Should_LetTheGroupAdminEditEverything_When_TheyOpenTheirGroupsAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var studio = await StudioOfAsync(admin, actId);

        Assert.Equal(
            (false, true, true, true),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_ShowTheActWithoutTheStudio_When_AGroupMemberIsNotInTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, removed: [ctx.Identity.People.IdOf(Ben)]);
        var ben = await ctx.Identity.ClientForAsync(Ben, ct);

        var studio = await StudioOfAsync(ben, actId);

        Assert.False(studio.Viewer.InCast);
        Assert.Null(studio.Studio);
    }

    [Fact]
    public async Task Should_LetACoEditorEditTheStudio_When_TheGroupAdminGrantedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await GrantCoEditorAsync(admin, actId, ctx.Identity.People.IdOf(Anna));
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.Equal(
            (true, false, true, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.Equal(["Anna"], studio.CoEditors.Select(person => person.FirstName));
    }

    [Fact]
    public async Task Should_Forbid_When_TheViewerHasNoTieToTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var clara = await ctx.Identity.ClientForAsync(Clara, ct);

        var (response, _) = await clara.GETAsync<
            GetActStudio,
            GetActStudioRequest,
            GetActStudioResponse
        >(new() { ActId = actId });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowTheStudio_When_AGuestIsAddedToTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, added: [ctx.Identity.People.IdOf(Clara)]);
        var clara = await ctx.Identity.ClientForAsync(Clara, ct);

        var studio = await StudioOfAsync(clara, actId);

        Assert.True(studio.Viewer.InCast);
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_OfferOnlyTheSettingsToRestoreIt_When_TheActIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = actId, Archived = true }
        );

        var studio = await StudioOfAsync(admin, actId);

        Assert.Equal(
            (true, false, false),
            (
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_TakeTheStudioFromACoEditor_When_SheLeavesTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var annaId = ctx.Identity.People.IdOf(Anna);
        await GrantCoEditorAsync(admin, actId, annaId);
        await admin.PUTAsync<PutAct, PutActRequest>(
            new()
            {
                ActId = actId,
                Name = "Gardetanz",
                GroupId = ctx.Groups.Groups.IdOf(Garde),
                Kind = ActKind.Dance,
                SessionYear = null,
                AddedPersonIds = [],
                RemovedPersonIds = [annaId],
                Wishes = [],
            }
        );
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.False(studio.Viewer.CanEditStudio);
        Assert.Null(studio.Studio);
    }

    [Fact]
    public Task Should_ListTheGroupsComingTrainingsWithTheSpotsLeftOpen_When_DancersSentAnAbsageEvenWithoutTheSwitch() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var today = _fixture.Today;
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        GardeWithDancers(today)(builder);
                        builder.Club(club =>
                            club.AddCalendarEntry(
                                    "last-week",
                                    "Training letzte Woche",
                                    TrainingOn(today.AddDays(-7)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: Garde,
                                    asksForResponse: true
                                )
                                .AddCalendarEntry(
                                    "soon",
                                    "Training",
                                    TrainingOn(today.AddDays(2)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: Garde,
                                    asksForResponse: true
                                )
                                .AddCalendarEntry(
                                    "elferrat",
                                    "Elferrat-Training",
                                    TrainingOn(today.AddDays(3)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: Elferrat,
                                    asksForResponse: true
                                )
                                .AddCalendarEntry(
                                    "meeting",
                                    "Gruppenabend",
                                    TrainingOn(today.AddDays(4)),
                                    kind: CalendarEntryKind.Meeting,
                                    ownerGroupAlias: Garde,
                                    asksForResponse: true
                                )
                                .AddCalendarEntry(
                                    "rehearsal",
                                    "Stellprobe",
                                    TrainingOn(today.AddDays(5)),
                                    kind: CalendarEntryKind.Rehearsal,
                                    participatingGroupAliases: [Garde]
                                )
                                .AddCalendarEntry(
                                    "later",
                                    "Training",
                                    TrainingOn(today.AddDays(9)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: Garde,
                                    asksForResponse: true
                                )
                                .AddAttendanceResponse("anna-no", "soon", Anna, AttendanceAnswer.No)
                                .AddAttendanceResponse(
                                    "ben-maybe",
                                    "soon",
                                    Ben,
                                    AttendanceAnswer.Maybe
                                )
                                .AddAttendanceResponse(
                                    "clara-no",
                                    "soon",
                                    Clara,
                                    AttendanceAnswer.No
                                )
                                .AddAttendanceResponse(
                                    "anna-no-past",
                                    "last-week",
                                    Anna,
                                    AttendanceAnswer.No
                                )
                                .AddAttendanceResponse(
                                    "ben-yes",
                                    "later",
                                    Ben,
                                    AttendanceAnswer.Yes
                                )
                                .AddAttendanceResponse(
                                    "ben-no-rehearsal",
                                    "rehearsal",
                                    Ben,
                                    AttendanceAnswer.No
                                )
                        );
                    },
                    ct
                );
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var annasSpot = await AddSpotAsync(admin, actId);
                var bensSpot = await AddSpotAsync(admin, actId);
                await AddSpotAsync(admin, actId);
                await AssignSpotAsync(admin, actId, annasSpot, ctx.Identity.People.IdOf(Anna));
                await AssignSpotAsync(admin, actId, bensSpot, ctx.Identity.People.IdOf(Ben));
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);

                var studio = await StudioOfAsync(anna, actId);

                Assert.NotNull(studio.Studio);
                Assert.Equal(
                    [
                        (ctx.Club.CalendarEntries.IdOf("soon"), $"{annasSpot}"),
                        (ctx.Club.CalendarEntries.IdOf("rehearsal"), $"{bensSpot}"),
                        (ctx.Club.CalendarEntries.IdOf("later"), ""),
                    ],
                    studio.Studio.Trainings.Select(training =>
                        (training.CalendarEntryId, string.Join(",", training.OpenSpotIds))
                    )
                );
            }
        );

    private static DateTimeOffset TrainingOn(DateOnly day) =>
        ClubClock.At(day, new TimeOnly(18, 30));
}
