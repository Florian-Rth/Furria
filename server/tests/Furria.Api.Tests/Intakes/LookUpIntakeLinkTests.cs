using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Core.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class LookUpIntakeLinkTests : IClassFixture<ApiTestFixture>
{
    private const string UnknownToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    private readonly ApiTestFixture _fixture;

    public LookUpIntakeLinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("expired", IntakeLinkState.Expired)]
    [InlineData("needs-review", IntakeLinkState.Used)]
    [InlineData("discarded", IntakeLinkState.Discarded)]
    public async Task Should_SayWhyTheLinkIsClosed_When_ItCanNoLongerBeFilledIn(
        string alias,
        IntakeLinkState expected
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes
                    .AddIntake(
                        "expired",
                        Manager,
                        groupAliases: [Guard],
                        expiresAt: now.AddSeconds(-1)
                    )
                    .AddIntake(
                        "needs-review",
                        Manager,
                        groupAliases: [Guard],
                        submittedName: ("Lena", "Neu")
                    )
                    .AddIntake("discarded", Manager, groupAliases: [Guard], discardedAt: now)
            ),
            ct
        );

        var (response, link) = await LookUpAsync(ctx.Intakes.LinkTokens.IdOf(alias));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(expected, link.State);
    }

    [Fact]
    public async Task Should_NotKnowTheLink_When_ItWasNeverIssuedOrHasBeenRenewed()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(With(), ct);

        var (response, _) = await LookUpAsync(UnknownToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<TestResult<LookUpIntakeLinkResponse>> LookUpAsync(string token) =>
        _fixture
            .CreateClient()
            .POSTAsync<LookUpIntakeLink, LookUpIntakeLinkRequest, LookUpIntakeLinkResponse>(
                new() { Token = token }
            );
}
