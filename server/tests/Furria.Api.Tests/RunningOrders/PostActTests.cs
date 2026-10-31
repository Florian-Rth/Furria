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
public sealed class PostActTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreTheActWithItsCastChangesAndWishes_When_ThePlannerCreatesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var gardeId = ctx.Groups.Groups.IdOf(Garde);

        var (response, result) = await PostAsync(
            client,
            "  Gardetanz ",
            gardeId,
            [people.IdOf(Clara)],
            [people.IdOf(Ben)],
            [Wish(RunningOrderRuleKind.SecondHalf, RuleStrength.Must)]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Act(result.ActId)
            .ToHaveName("Gardetanz")
            .Act(result.ActId)
            .ToBelongTo(gardeId)
            .Act(result.ActId)
            .ToChangeTheCastExactly(
                (people.IdOf(Clara), CastChange.Added),
                (people.IdOf(Ben), CastChange.Removed)
            )
            .Act(result.ActId)
            .ToWishExactly((RunningOrderRuleKind.SecondHalf, RuleStrength.Must))
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(ActKind.Dance, true)]
    [InlineData(ActKind.Speech, true)]
    [InlineData(ActKind.Point, false)]
    [InlineData(null, false)]
    public async Task Should_FileTheActUnderTheRelevantSession_When_ItsKindTrainsAndNoneIsNamed(
        ActKind? kind,
        bool belongsToASession
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);

                var actId = await CreateActAsync(client, "Auftritt", kind: kind);

                int? expected = belongsToASession ? RunningSessionYear : null;
                await ctx.Expected.Act(actId).ToBelongToSession(expected).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_FileTheDanceUnderTheComingSession_When_ItIsCreatedAfterAshWednesday()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);

                var actId = await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);

                await ctx
                    .Expected.Act(actId)
                    .ToBelongToSession(RunningSessionYear + 1)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_FileTheDanceUnderTheNamedSession_When_ThePlannerChoosesTheNextOne()
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

                await ctx
                    .Expected.Act(actId)
                    .ToBelongToSession(RunningSessionYear + 1)
                    .AssertAsync(ct);
            }
        );
    }

    [Theory]
    [InlineData(ActKind.Dance, -1)]
    [InlineData(ActKind.Point, 0)]
    public async Task Should_RefuseTheAct_When_ItsSessionIsPastOrItIsTimeless(
        ActKind kind,
        int yearsFromRelevant
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);

                var (response, _) = await client.POSTAsync<
                    PostAct,
                    PostActRequest,
                    PostActResponse
                >(
                    new()
                    {
                        Name = "Gardetanz",
                        GroupId = null,
                        Kind = kind,
                        SessionYear = RunningSessionYear + yearsFromRelevant,
                        AddedPersonIds = [],
                        RemovedPersonIds = [],
                        Wishes = [],
                    }
                );

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_RefuseTheAct_When_ItsGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var (response, _) = await PostAsync(
            client,
            "Alter Tanz",
            ctx.Groups.Groups.IdOf(ArchivedGroup),
            [],
            [],
            []
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            "Eine archivierte Gruppe lässt sich keinem Auftritt zuordnen.",
            await RefusalOfAsync(response)
        );
    }

    [Theory]
    [InlineData("added-and-removed")]
    [InlineData("removed-without-group")]
    [InlineData("wish-about-two-acts")]
    public async Task Should_RefuseTheAct_When_ItsCastOrWishesContradict(string contradiction)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);

        var (response, _) = contradiction switch
        {
            "added-and-removed" => await PostAsync(client, "Tanz", gardeId, [anna], [anna], []),
            "removed-without-group" => await PostAsync(client, "Tanz", null, [], [anna], []),
            _ => await PostAsync(
                client,
                "Tanz",
                null,
                [],
                [],
                [Wish(RunningOrderRuleKind.Apart, RuleStrength.Must)]
            ),
        };

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_StoreTheAct_When_AGroupAdminCreatesItForHisGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);

        var (response, result) = await PostAsync(admin, "Gardetanz", gardeId, [], [], []);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Act(result.ActId).ToBelongTo(gardeId).AssertAsync(ct);
    }

    [Theory]
    [InlineData(Elferrat)]
    [InlineData(null)]
    public async Task Should_ReturnForbidden_When_AGroupAdminCreatesAnActOutsideHisGroups(
        string? groupAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        int? groupId = groupAlias is null ? null : ctx.Groups.Groups.IdOf(groupAlias);

        var (response, _) = await PostAsync(admin, "Fremder Auftritt", groupId, [], [], []);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminCreatesAnActWithWishes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);

        var (response, _) = await PostAsync(
            admin,
            "Gardetanz",
            gardeId,
            [],
            [],
            [Wish(RunningOrderRuleKind.First, RuleStrength.Must)]
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static Task<TestResult<PostActResponse>> PostAsync(
        HttpClient client,
        string name,
        int? groupId,
        IReadOnlyList<int> added,
        IReadOnlyList<int> removed,
        IReadOnlyList<ActWishDataDto> wishes
    ) =>
        client.POSTAsync<PostAct, PostActRequest, PostActResponse>(
            new()
            {
                Name = name,
                GroupId = groupId,
                Kind = null,
                SessionYear = null,
                AddedPersonIds = added,
                RemovedPersonIds = removed,
                Wishes = wishes,
            }
        );
}
