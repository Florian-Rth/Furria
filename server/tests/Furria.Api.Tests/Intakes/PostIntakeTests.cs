using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Core.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class PostIntakeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheIntakeForSevenDaysWithTheDecision_When_AManagerStartsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(Manager, ct);
        var memberFrom = _fixture.Today.AddDays(14);

        var (response, started) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(
            new()
            {
                MemberFrom = memberFrom,
                GroupIds = [ctx.Groups.Groups.IdOf(Guard)],
                Label = "  Lenas Schwester  ",
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddDays(7), started.ExpiresAt);
        await ctx
            .Expected.Intake(started.IntakeId)
            .ToBeStartedBy(ctx.Identity.People.IdOf(Manager))
            .Intake(started.IntakeId)
            .ToDecide(memberFrom, ctx.Groups.Groups.IdOf(Guard))
            .Intake(started.IntakeId)
            .ToHaveLabel("Lenas Schwester")
            .Intake(started.IntakeId)
            .ToOpenUntil(started.ExpiresAt, started.Token)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StartTheIntake_When_AGroupAdminBringsSomeoneIntoHerGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = null, GroupIds = [ctx.Groups.Groups.IdOf(Guard)] });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_AGroupAdminDecidesAMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = _fixture.Today, GroupIds = [ctx.Groups.Groups.IdOf(Guard)] });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_AGroupAdminPicksAGroupSheDoesNotRun()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(
            new()
            {
                MemberFrom = null,
                GroupIds = [ctx.Groups.Groups.IdOf(Guard), ctx.Groups.Groups.IdOf(Show)],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_SomeoneWhoNeitherManagesPersonsNorRunsAGroupStartsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(Member, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = _fixture.Today, GroupIds = [] });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheManagingLoginWithoutAPersonStartsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = _fixture.Today, GroupIds = [] });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheIntake_When_ItCarriesNeitherMembershipNorGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = null, GroupIds = [] });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheIntake_When_AGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, _) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = null, GroupIds = [ctx.Groups.Groups.IdOf(Retired)] });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
