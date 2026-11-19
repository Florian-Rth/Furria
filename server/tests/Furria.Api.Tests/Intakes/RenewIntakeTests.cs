using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class RenewIntakeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public RenewIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReopenItUnderANewLink_When_AnExpiredIntakeIsRenewed()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "expired",
                    GuardTrainer,
                    groupAliases: [Guard],
                    label: "Lenas Schwester",
                    expiresAt: now.AddSeconds(-1)
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);
        var intakeId = ctx.Intakes.Intakes.IdOf("expired");

        var (response, renewed) = await client.POSTAsync<
            RenewIntake,
            RenewIntakeRequest,
            RenewIntakeResponse
        >(new() { IntakeId = intakeId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Intakes.LinkTokens.IdOf("expired"), renewed.Token);
        await ctx
            .Expected.Intake(intakeId)
            .ToOpenUntil(now.AddDays(7), renewed.Token)
            .Intake(intakeId)
            .ToHaveLabel("Lenas Schwester")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRenewal_When_TheNewcomerHasAlreadyFilledItIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "review",
                    Manager,
                    groupAliases: [Guard],
                    submittedName: ("Lena", "Neu")
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, _) = await client.POSTAsync<
            RenewIntake,
            RenewIntakeRequest,
            RenewIntakeResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("review") });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
