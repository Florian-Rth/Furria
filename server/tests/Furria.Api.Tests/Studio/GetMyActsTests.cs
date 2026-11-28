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
using static Furria.Api.Tests.Studio.AttendanceSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetMyActsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset AtTheSessionOpening = ClubClock.At(
        new DateOnly(2026, 11, 11),
        new TimeOnly(12, 0)
    );

    private readonly ApiTestFixture _fixture;

    public GetMyActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
        Assert.Contains("Anna", act.Cast.Select(member => member.FirstName));
        Assert.Equal(["Gerd"], act.Editors.Select(editor => editor.FirstName));
    }

    [Fact]
    public async Task Should_LeaveOutACoEditor_When_SheLeftTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                await GrantCoEditorAsync(admin, actId, ctx.Identity.People.IdOf(Ben));
            }
        );

        await _fixture.AtInstantAsync(
            InTheRunningSession.AddDays(GalaInDays),
            async () =>
            {
                var anna = await ctx!.Identity.SignInAgainAsync(Anna, ct);

                var (_, result) = await anna.GETAsync<GetMyActs, GetMyActsResponse>();

                var act = Assert.Single(result.Acts);
                Assert.Equal(["Gerd"], act.Editors.Select(editor => editor.FirstName));
            }
        );
    }

    [Fact]
    public async Task Should_SkipACancelledEvening_When_TellingTheNextEvening()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AtTheSessionOpening,
            async () =>
            {
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
        );
    }
}
