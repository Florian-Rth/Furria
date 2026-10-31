using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.AttendanceSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetMyActsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetMyActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheRelevantSessionsActsTheViewerDancesIn_When_AskedForTheirActs()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var ben = ctx.Identity.People.IdOf(Ben);
        await GardetanzAsync(ctx, ct, name: "Marsch");
        await GardetanzAsync(ctx, ct, name: "Polka", removed: [ben]);
        var archived = await GardetanzAsync(ctx, ct, name: "Alter Tanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = archived, Archived = true }
        );
        await CreateActAsync(
            admin,
            "Nächstes Jahr",
            ctx.Groups.Groups.IdOf(Garde),
            ActKind.Dance,
            sessionYear: ClubSession.RelevantYearOf(_fixture.Today) + 1
        );
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        await CreateActAsync(planner, "Einmarsch", kind: ActKind.Point, added: [ben]);
        var client = await ctx.Identity.ClientForAsync(Ben, ct);

        var (_, result) = await client.GETAsync<GetMyActs, GetMyActsResponse>();

        Assert.Equal(["Marsch"], result.Acts.Select(act => act.Name));
        Assert.Equal("Tanzgarde", result.Acts[0].Group?.Name);
    }

    [Fact]
    public async Task Should_GiveACastMemberHerNextEveningTrainingAndWhomToAsk_When_AskedForTheirActs()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var training = ctx.Club.CalendarEntries.IdOf(GardeTraining);
        var actId = await GardetanzAsync(ctx, ct);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, gala, null, [Line(rede, 0), Line(actId, 1)]);
        await AddedSongAsync(admin, actId, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);
        await AnswerAsync(anna, training, AttendanceAnswer.No);

        var (_, result) = await anna.GETAsync<GetMyActs, GetMyActsResponse>();

        var act = Assert.Single(result.Acts);
        Assert.True(act.ViewerInCast);
        Assert.False(act.ViewerLeads);
        Assert.True(act.Playable);
        Assert.Equal(gala, act.NextEvening?.EventId);
        Assert.Equal(1, act.NextEvening?.Position);
        Assert.Equal(training, act.NextTraining?.CalendarEntryId);
        Assert.Equal(AttendanceAnswer.No, act.NextTraining?.ViewerAnswer);
        Assert.Equal(1, act.NextTraining?.Absent);
        Assert.Contains("Anna", act.Cast.Select(member => member.FirstName));
        Assert.Equal(["Gerd"], act.Editors.Select(editor => editor.FirstName));
    }

    [Fact]
    public async Task Should_ListTheActsOfTheGroupsSheLeads_When_ATrainerOutsideTheCastAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
        var training = ctx.Club.CalendarEntries.IdOf(GardeTraining);
        await GardetanzAsync(ctx, ct, name: "Marsch");
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);
        await AnswerAsync(anna, training, AttendanceAnswer.Yes);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var (_, result) = await admin.GETAsync<GetMyActs, GetMyActsResponse>();

        var act = Assert.Single(result.Acts);
        Assert.Equal("Marsch", act.Name);
        Assert.False(act.ViewerInCast);
        Assert.True(act.ViewerLeads);
        Assert.False(act.Playable);
        Assert.Null(act.NextEvening);
        Assert.NotNull(act.NextTraining);
        Assert.Null(act.NextTraining.ViewerAnswer);
        Assert.Equal(1, act.NextTraining.Present);
    }

    [Fact]
    public async Task Should_SkipACancelledEvening_When_TellingTheNextEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var summerParty = ctx.Club.Events.IdOf(SummerParty);
        var actId = await GardetanzAsync(ctx, ct);
        await SavedAsync(planner, gala, null, [Line(actId, 0)]);
        await SavedAsync(planner, summerParty, null, [Line(actId, 0)]);
        await _fixture.CancelEventDirectlyAsync(gala, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var (_, result) = await anna.GETAsync<GetMyActs, GetMyActsResponse>();

        Assert.Equal(summerParty, Assert.Single(result.Acts).NextEvening?.EventId);
    }
}
