using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class DiscardIntakeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DiscardIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DiscardTheIntakeAndItsLink_When_TheStarterDiscardsAnOpenOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("open", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);
        var intakeId = ctx.Intakes.Intakes.IdOf("open");

        var response = await client.POSTAsync<DiscardIntake, DiscardIntakeRequest>(
            new() { IntakeId = intakeId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Intake(intakeId).ToBeDiscardedWithNothingOfHers().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetWhatTheNewcomerTypedIn_When_AnIntakeAwaitingReviewIsDiscarded()
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
        var intakeId = ctx.Intakes.Intakes.IdOf("review");

        var response = await client.POSTAsync<DiscardIntake, DiscardIntakeRequest>(
            new() { IntakeId = intakeId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await ctx.Expected.Intake(intakeId).ToBeDiscardedWithNothingOfHers().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheDiscardAgain_When_TheIntakeIsAlreadyDiscarded()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "gone",
                    Manager,
                    groupAliases: [Guard],
                    discardedAt: now.AddHours(-1)
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var response = await client.POSTAsync<DiscardIntake, DiscardIntakeRequest>(
            new() { IntakeId = ctx.Intakes.Intakes.IdOf("gone") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseToDiscard_When_TheIntakeIsCompleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "done",
                    Manager,
                    groupAliases: [Guard],
                    completedAsPersonAlias: Member
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var response = await client.POSTAsync<DiscardIntake, DiscardIntakeRequest>(
            new() { IntakeId = ctx.Intakes.Intakes.IdOf("done") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_AGroupAdminDiscardsAnIntakeSheDidNotStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("board", Manager, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var response = await client.POSTAsync<DiscardIntake, DiscardIntakeRequest>(
            new() { IntakeId = ctx.Intakes.Intakes.IdOf("board") }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
