using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

[Collection("Api")]
public sealed class GetMembershipApplicationChallengeTests
{
    private const string Algorithm = "PBKDF2/SHA-256";

    private readonly ApiTestFixture _fixture;

    public GetMembershipApplicationChallengeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_IssueAChallengeThatExpiresInTenMinutes_When_AVisitorAsksForOne()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);

        var (response, challenge) = await _fixture
            .CreateClient()
            .GETAsync<
                GetMembershipApplicationChallenge,
                GetMembershipApplicationChallengeResponse
            >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(Algorithm, challenge.Parameters.Algorithm);
        Assert.Equal(
            _fixture.TimeProvider.GetUtcNow().AddMinutes(10).ToUnixTimeSeconds(),
            challenge.Parameters.ExpiresAt
        );
        Assert.NotEmpty(challenge.Signature);
    }

    [Fact]
    public async Task Should_IssueAFreshChallenge_When_AVisitorAsksAgain()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        var client = _fixture.CreateClient();

        var first = await MembershipApplicationSteps.ChallengeAsync(client);
        var second = await MembershipApplicationSteps.ChallengeAsync(client);

        Assert.NotEqual(first.Parameters.Nonce, second.Parameters.Nonce);
        Assert.NotEqual(first.Parameters.Salt, second.Parameters.Salt);
    }
}
