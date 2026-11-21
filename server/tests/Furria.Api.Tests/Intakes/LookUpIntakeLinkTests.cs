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

    [Fact]
    public async Task Should_NameTheClubAndAskForHerAddress_When_SheBecomesAMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today))(builder);
                builder.Club(club => club.SetClubRecord(name: "Faschingsclub Narrenstadt"));
            },
            ct
        );

        var (response, link) = await LookUpAsync(ctx.Intakes.LinkTokens.IdOf("fresh"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Faschingsclub Narrenstadt", link.ClubName);
        Assert.Equal(IntakeLinkState.Open, link.State);
        Assert.True(link.AddressRequired);
    }

    [Fact]
    public async Task Should_NotAskForHerAddress_When_SheOnlyJoinsGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard])),
            ct
        );

        var (_, link) = await LookUpAsync(ctx.Intakes.LinkTokens.IdOf("fresh"));

        Assert.False(link.AddressRequired);
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
