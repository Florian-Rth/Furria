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
    public async Task Should_RefuseTheAct_When_ItsGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var (response, _) = await PostAsync(
            client,
            "Alter Tanz",
            ctx.Groups.Groups.IdOf(ArchivedGroup),
            []
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            "Eine archivierte Gruppe lässt sich keinem Auftritt zuordnen.",
            await RefusalOfAsync(response)
        );
    }

    [Fact]
    public async Task Should_RefuseTheAct_When_AWishIsAboutTwoActs()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var (response, _) = await PostAsync(
            client,
            "Tanz",
            null,
            [Wish(RunningOrderRuleKind.Apart, RuleStrength.Must)]
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
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

        var (response, _) = await PostAsync(admin, "Fremder Auftritt", groupId, []);

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
            [Wish(RunningOrderRuleKind.First, RuleStrength.Must)]
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static Task<TestResult<PostActResponse>> PostAsync(
        HttpClient client,
        string name,
        int? groupId,
        IReadOnlyList<ActWishDataDto> wishes
    ) =>
        client.POSTAsync<PostAct, PostActRequest, PostActResponse>(
            new()
            {
                Name = name,
                GroupId = groupId,
                Kind = null,
                SessionYear = null,
                Wishes = wishes,
            }
        );
}
