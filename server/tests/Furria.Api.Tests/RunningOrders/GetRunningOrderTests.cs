using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class GetRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CastTheMembersOfTheEventDateAndFlagAbsences_When_SomeoneAnsweredNo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGala(
                _fixture.Today,
                club =>
                    club.AddAttendanceResponse("dora-no", Gala, Dora, AttendanceAnswer.No)
                        .AddAttendanceResponse("anna-maybe", Gala, Anna, AttendanceAnswer.Maybe)
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await CreateActAsync(client, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        await SavedAsync(client, eventId, null, [Line(tanz, 0)]);

        var (response, result) = await GetAsync(client, eventId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var line = Assert.Single(result.Lines);
        Assert.Equal(
            [(people.IdOf(Anna), false), (people.IdOf(Dora), true)],
            line.Act!.Cast.Select(person => (person.PersonId, person.Absent))
        );
        var finding = Assert.Single(result.Findings);
        Assert.Equal(FindingKind.Absences, finding.Kind);
        Assert.Equal([people.IdOf(Dora)], finding.PersonIds);
    }

    [Fact]
    public async Task Should_RecheckTheOrder_When_TheCastChangedAfterSaving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var clara = ctx.Identity.People.IdOf(Clara);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(client, "Büttenrede", added: [clara]);
        var lied = await CreateActAsync(client, "Lied");
        var saved = await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
        await client.PUTAsync<PutAct, PutActRequest>(
            new()
            {
                ActId = lied,
                Name = "Lied",
                GroupId = null,
                Kind = ActKind.Music,
                SessionYear = null,
                AddedPersonIds = [clara],
                RemovedPersonIds = [],
                Wishes = [],
            }
        );

        var (_, result) = await GetAsync(client, eventId);

        Assert.Empty(saved.Findings);
        var finding = Assert.Single(result.Findings);
        Assert.Equal(FindingKind.NoChangeover, finding.Kind);
        Assert.Equal([clara], finding.PersonIds);
        Assert.Equal(saved.Version, result.Version);
    }

    [Fact]
    public async Task Should_CastTheEveningAndCheckIt_When_TheAppearanceChangesTheCastForTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await CreateActAsync(client, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        var rede = await CreateActAsync(client, "Büttenrede", added: [people.IdOf(Clara)]);
        await SavedAsync(client, eventId, null, [Line(tanz, 0), Line(rede, 1)]);
        await _fixture.ChangeEveningCastDirectlyAsync(
            eventId,
            tanz,
            people.IdOf(Clara),
            CastChange.Added,
            ct
        );
        await _fixture.ChangeEveningCastDirectlyAsync(
            eventId,
            tanz,
            people.IdOf(Anna),
            CastChange.Removed,
            ct
        );

        var (_, result) = await GetAsync(client, eventId);

        var dance = result.Lines.Single(line => line.Act.ActId == tanz);
        Assert.Equal([EveningChange.Cast], dance.EveningChanges);
        Assert.Equal(
            [people.IdOf(Clara), people.IdOf(Dora)],
            dance.Act.Cast.Select(person => person.PersonId)
        );
        Assert.Empty(result.Lines.Single(line => line.Act.ActId == rede).EveningChanges);
        var finding = Assert.Single(result.Findings);
        Assert.Equal(FindingKind.NoChangeover, finding.Kind);
        Assert.Equal([people.IdOf(Clara)], finding.PersonIds);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventHasNoRunningOrder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var (response, _) = await GetAsync(client, ctx.Club.Events.IdOf(Gala));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<TestResult<GetRunningOrderResponse>> GetAsync(
        HttpClient client,
        int eventId
    ) =>
        client.GETAsync<GetRunningOrder, GetRunningOrderRequest, GetRunningOrderResponse>(
            new() { EventId = eventId }
        );
}
