using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class GetIntakeByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetIntakeByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowTheLinkAgain_When_TheIntakeIsStillOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("open", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, shown) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("open") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Intakes.LinkTokens.IdOf("open"), shown.Token);
    }

    [Fact]
    public async Task Should_HideTheLink_When_TheIntakeHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "expired",
                    Manager,
                    groupAliases: [Guard],
                    expiresAt: now.AddSeconds(-1)
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (_, shown) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("expired") });

        Assert.Null(shown.Token);
    }

    [Fact]
    public async Task Should_HideTheLink_When_AGroupAdminViewsAnIntakeSheDidNotStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("board", Manager, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, shown) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("board") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(shown.Intake.CanManage);
        Assert.Null(shown.Token);
    }

    [Fact]
    public async Task Should_NotFindTheIntake_When_ItTouchesNoneOfTheGroupAdminsGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("show", ShowTrainer, groupAliases: [Show])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, _) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("show") });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
