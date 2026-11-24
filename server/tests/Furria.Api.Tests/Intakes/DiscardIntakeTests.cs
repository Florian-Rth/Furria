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
}
