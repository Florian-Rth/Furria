using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class PutActTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheCastChangesAndKeepTheWishIds_When_ThePlannerEditsTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var actId = await CreateActAsync(
            client,
            "Begrüßung",
            added: [people.IdOf(Anna), people.IdOf(Ben)],
            wishes: [Wish(RunningOrderRuleKind.First, RuleStrength.Prefer)]
        );
        var wishId = await WishIdOfAsync(client, actId);

        var response = await PutAsync(
            client,
            actId,
            "Große Begrüßung",
            [people.IdOf(Ben), people.IdOf(Clara)],
            [
                Wish(RunningOrderRuleKind.First, RuleStrength.Must),
                Wish(RunningOrderRuleKind.Early, RuleStrength.Prefer),
            ]
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(wishId, await WishIdOfAsync(client, actId));
        await ctx
            .Expected.Act(actId)
            .ToHaveName("Große Begrüßung")
            .Act(actId)
            .ToChangeTheCastExactly(
                (people.IdOf(Ben), CastChange.Added),
                (people.IdOf(Clara), CastChange.Added)
            )
            .Act(actId)
            .ToWishExactly(
                (RunningOrderRuleKind.First, RuleStrength.Must),
                (RunningOrderRuleKind.Early, RuleStrength.Prefer)
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheActIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(client, "Tombola");
        await client.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = actId, Archived = true }
        );

        var response = await PutAsync(client, actId, "Große Tombola", [], []);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.Act(actId).ToHaveName("Tombola").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheActsSessionHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        var actId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                actId = await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);
            }
        );

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                var client = await ctx!.Identity.SignInAgainAsync(Planner, ct);

                var response = await PutAsync(client, actId, "Neuer Gardetanz", [], []);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                await ctx.Expected.Act(actId).ToHaveName("Gardetanz").AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheChosenSession_When_TheEditNamesNone()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                var actId = await CreateActAsync(
                    client,
                    "Gardetanz",
                    kind: ActKind.Dance,
                    sessionYear: RunningSessionYear + 1
                );

                var response = await client.PUTAsync<PutAct, PutActRequest>(
                    new()
                    {
                        ActId = actId,
                        Name = "Neuer Gardetanz",
                        GroupId = null,
                        Kind = ActKind.Show,
                        SessionYear = null,
                        AddedPersonIds = [],
                        RemovedPersonIds = [],
                        Wishes = [],
                    }
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Act(actId)
                    .ToBelongToSession(RunningSessionYear + 1)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_DropTheSession_When_TheDanceBecomesAnAblaufpunkt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);

        var response = await PutAsync(client, actId, "Gardetanz", [], []);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Act(actId).ToBelongToSession(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheActIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var response = await PutAsync(client, 999_999, "Tombola", [], []);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_StoreTheEdit_When_AGroupAdminEditsAnActOfHisGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var actId = await CreateActAsync(planner, "Gardetanz", gardeId);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await PutAsync(admin, actId, "Großer Gardetanz", gardeId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Act(actId).ToHaveName("Großer Gardetanz").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheEdit_When_AGroupAdminKeepsThePlannersWishes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var actId = await CreateActAsync(
            planner,
            "Gardetanz",
            gardeId,
            wishes: [Wish(RunningOrderRuleKind.First, RuleStrength.Must)]
        );
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await PutAsync(
            admin,
            actId,
            "Großer Gardetanz",
            [],
            [Wish(RunningOrderRuleKind.First, RuleStrength.Must)],
            gardeId
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Act(actId)
            .ToHaveName("Großer Gardetanz")
            .Act(actId)
            .ToWishExactly((RunningOrderRuleKind.First, RuleStrength.Must))
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("added")]
    [InlineData("strengthened")]
    [InlineData("removed")]
    public async Task Should_ReturnForbidden_When_AGroupAdminChangesTheWishes(string change)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var actId = await CreateActAsync(
            planner,
            "Gardetanz",
            gardeId,
            wishes: [Wish(RunningOrderRuleKind.First, RuleStrength.Prefer)]
        );
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        IReadOnlyList<ActWishDataDto> wishes = change switch
        {
            "added" =>
            [
                Wish(RunningOrderRuleKind.First, RuleStrength.Prefer),
                Wish(RunningOrderRuleKind.Early, RuleStrength.Prefer),
            ],
            "strengthened" => [Wish(RunningOrderRuleKind.First, RuleStrength.Must)],
            _ => [],
        };

        var response = await PutAsync(admin, actId, "Großer Gardetanz", [], wishes, gardeId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Act(actId)
            .ToHaveName("Gardetanz")
            .Act(actId)
            .ToWishExactly((RunningOrderRuleKind.First, RuleStrength.Prefer))
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(Elferrat)]
    [InlineData(null)]
    public async Task Should_ReturnForbidden_When_AGroupAdminEditsAnActOutsideHisGroups(
        string? groupAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        int? groupId = groupAlias is null ? null : ctx.Groups.Groups.IdOf(groupAlias);
        var actId = await CreateActAsync(planner, "Fremder Auftritt", groupId);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await PutAsync(admin, actId, "Übernommen", groupId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Act(actId).ToHaveName("Fremder Auftritt").AssertAsync(ct);
    }

    [Theory]
    [InlineData(Elferrat, false)]
    [InlineData(Elferrat, true)]
    [InlineData(null, false)]
    public async Task Should_ReturnForbidden_When_AGroupAdminMovesAnActOfHisGroupElsewhere(
        string? targetAlias,
        bool leadsTheTargetToo
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGardeAdmin(_fixture.Today)
                + (
                    builder =>
                        builder.Groups(groups =>
                        {
                            if (leadsTheTargetToo)
                                groups.AddGroupAdmin("gerd-elferrat", Elferrat, GardeAdmin);
                        })
                ),
            ct
        );
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var actId = await CreateActAsync(planner, "Gardetanz", gardeId);
        int? targetId = targetAlias is null ? null : ctx.Groups.Groups.IdOf(targetAlias);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await PutAsync(admin, actId, "Gardetanz", targetId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Act(actId).ToBelongTo(gardeId).AssertAsync(ct);
    }

    private static async Task<int> WishIdOfAsync(HttpClient client, int actId)
    {
        var (_, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(new());

        return result
            .Acts.Single(act => act.ActId == actId)
            .Wishes.Single(wish => wish.Kind == RunningOrderRuleKind.First)
            .ActWishId;
    }

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        string name,
        int? groupId
    ) => PutAsync(client, actId, name, [], [], groupId);

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        string name,
        IReadOnlyList<int> added,
        IReadOnlyList<ActWishDataDto> wishes,
        int? groupId = null
    ) =>
        client.PUTAsync<PutAct, PutActRequest>(
            new()
            {
                ActId = actId,
                Name = name,
                GroupId = groupId,
                Kind = ActKind.Point,
                SessionYear = null,
                AddedPersonIds = added,
                RemovedPersonIds = [],
                Wishes = wishes,
            }
        );
}
