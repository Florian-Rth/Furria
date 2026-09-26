using System.Net;
using System.Text.Json;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class PostPasskeyRequestOptionsTests
{
    private const string Route = "/api/auth/passkeys/request-options";

    private readonly ApiTestFixture _fixture;

    public PostPasskeyRequestOptionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferADiscoverableRequestForTheClubAppDomain_When_Asked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var (response, result) = await PasskeySteps.RequestOptionsAsync(_fixture);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEmpty(result.ChallengeId);
        Assert.Equal("club.furria.test", result.Options.GetProperty("rpId").GetString());
        Assert.Equal("required", result.Options.GetProperty("userVerification").GetString());
        Assert.Empty(AllowedCredentialsOf(result.Options));
        await ctx.Expected.PasskeyChallenges().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_IssueADifferentChallenge_When_AskedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var (_, first) = await PasskeySteps.RequestOptionsAsync(_fixture);
        var (_, second) = await PasskeySteps.RequestOptionsAsync(_fixture);

        Assert.NotEqual(first.ChallengeId, second.ChallengeId);
        Assert.NotEqual(
            first.Options.GetProperty("challenge").GetString(),
            second.Options.GetProperty("challenge").GetString()
        );
        await ctx.Expected.PasskeyChallenges().ToHaveCount(2).AssertAsync(ct);
    }

    [Fact]
    public void Should_BeLimitedPerIp_When_TheRouteIsRegistered()
    {
        Assert.Equal(PasskeySteps.PerIpPolicy, PasskeySteps.RateLimitPolicyOf(_fixture, Route));
    }

    private static IEnumerable<JsonElement> AllowedCredentialsOf(JsonElement options) =>
        options.TryGetProperty("allowCredentials", out var allowed) ? allowed.EnumerateArray() : [];
}
