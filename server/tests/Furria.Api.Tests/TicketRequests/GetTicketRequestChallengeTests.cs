using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.TicketRequests;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

[Collection("Api")]
public sealed class GetTicketRequestChallengeTests
{
    private readonly ApiTestFixture _fixture;

    public GetTicketRequestChallengeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_IssueAChallengeThatExpiresInTenMinutes_When_AGuestAsksForOne()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);

        var (response, challenge) = await _fixture
            .CreateClient()
            .GETAsync<GetTicketRequestChallenge, GetTicketRequestChallengeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            _fixture.TimeProvider.GetUtcNow().AddMinutes(10).ToUnixTimeSeconds(),
            challenge.Parameters.ExpiresAt
        );
        Assert.NotEmpty(challenge.Signature);
    }
}
