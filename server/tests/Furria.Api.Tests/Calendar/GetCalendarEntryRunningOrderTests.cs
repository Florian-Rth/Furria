using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class GetCalendarEntryRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private const string Mia = "mia";
    private const int ChangeoverMinutes = 2;
    private const int SongSeconds = 240;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public GetCalendarEntryRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowThePlacedActsWithTheirApproximateStageTime_When_AMemberOpensTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EveningWithMembers(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        var tanz = await GardetanzAsync(ctx, ct);
        await SongOfAsync(_fixture, admin, tanz, SongSeconds, ct);
        var lied = await CreateActAsync(planner, "Lied", kind: ActKind.Music);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0), Line(rede, 1), Line(lied, null)]);
        var member = await ctx.Identity.ClientForAsync(Mia, ct);

        var (response, result) = await GetAsync(member, eventId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var eveningStart = await EveningStartOfAsync(planner, eventId);
        Assert.False(result.Confirmed);
        Assert.Equal(
            [
                (tanz, 0, eveningStart),
                (rede, 1, eveningStart.AddSeconds(SongSeconds).AddMinutes(ChangeoverMinutes)),
            ],
            result.Lines.Select(line => (line.ActId, line.Position, line.StageStartsAt))
        );
    }

    [Fact]
    public async Task Should_MarkTheViewersOwnActs_When_SheDancesInOneOrBelongsToItsGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EveningWithMembers(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", added: [people.IdOf(Clara)]);
        var tanz = await GardetanzAsync(ctx, ct);
        await SavedAsync(planner, eventId, null, [Line(rede, 0), Line(tanz, 1)]);

        var owned = new List<(string Viewer, bool Rede, bool Tanz)>();
        foreach (var viewer in new[] { Mia, Anna, Clara })
        {
            var client = await ctx.Identity.ClientForAsync(viewer, ct);
            var (_, result) = await GetAsync(client, eventId);
            owned.Add((viewer, result.Lines[0].Own, result.Lines[1].Own));
        }

        Assert.Equal([(Mia, false, false), (Anna, false, true), (Clara, true, false)], owned);
    }

    [Fact]
    public async Task Should_SayTheOrderIsConfirmed_When_ThePlannerConfirmedItUnchanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EveningWithMembers(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, eventId, null, [Line(rede, 0)]);
        (await ConfirmAsync(planner, eventId, true)).Response.EnsureSuccessStatusCode();
        var member = await ctx.Identity.ClientForAsync(Mia, ct);

        var (_, result) = await GetAsync(member, eventId);

        Assert.True(result.Confirmed);
    }

    [Fact]
    public async Task Should_ShowAnEmptyOrder_When_TheEveningHasNoRunningOrderYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EveningWithMembers(_fixture.Today), ct);
        var member = await ctx.Identity.ClientForAsync(Mia, ct);

        var (response, result) = await GetAsync(member, ctx.Club.Events.IdOf(Gala));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Lines);
    }

    [Fact]
    public async Task Should_Return404_When_TheViewerCannotSeeTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(EveningWithMembers(_fixture.Today), ct);
        var outsider = await ctx.Identity.ClientForAsync(Ben, ct);

        var (response, _) = await GetAsync(outsider, ctx.Club.Events.IdOf(Gala));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Action<SeedContextBuilder> EveningWithMembers(DateOnly today) =>
        builder =>
        {
            PlannerWithGardeAdmin(today)(builder);
            builder.Identity(identity =>
                identity
                    .AddPerson(Mia, "Mia", "Mitglied")
                    .AddAccount(Mia)
                    .AddMembership("mia-member", Mia, JoinedIn2017)
                    .AddAccount(Anna)
                    .AddMembership("anna-member", Anna, JoinedIn2017)
                    .AddAccount(Clara)
                    .AddMembership("clara-member", Clara, JoinedIn2017)
                    .AddAccount(Ben)
            );
        };

    private static async Task<DateTimeOffset> EveningStartOfAsync(HttpClient client, int eventId)
    {
        var (response, result) = await client.GETAsync<
            GetCalendarEntryById,
            GetCalendarEntryByIdRequest,
            GetCalendarEntryByIdResponse
        >(new() { CalendarEntryId = eventId });
        response.EnsureSuccessStatusCode();

        return result.Entry.StartsAt;
    }

    private static Task<TestResult<GetCalendarEntryRunningOrderResponse>> GetAsync(
        HttpClient client,
        int eventId
    ) =>
        client.GETAsync<
            GetCalendarEntryRunningOrder,
            GetCalendarEntryRunningOrderRequest,
            GetCalendarEntryRunningOrderResponse
        >(new() { CalendarEntryId = eventId });
}
