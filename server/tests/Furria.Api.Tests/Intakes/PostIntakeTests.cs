using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
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
    public async Task Should_StartTheIntakeWithoutAStarter_When_TheManagingLoginWithoutAPersonStartsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, started) = await client.POSTAsync<
            PostIntake,
            PostIntakeRequest,
            PostIntakeResponse
        >(new() { MemberFrom = _fixture.Today, GroupIds = [] });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Intake(started.IntakeId).ToHaveNoStarter().AssertAsync(ct);
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
