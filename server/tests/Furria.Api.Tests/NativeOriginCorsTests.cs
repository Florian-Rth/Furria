using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class NativeOriginCorsTests
{
    private const string AndroidOrigin = "https://localhost";
    private const string IosOrigin = "capacitor://localhost";
    private const string ForeignOrigin = "https://furria.example";
    private const string LoginPath = "api/auth/login";

    private readonly ApiTestFixture _fixture;

    public NativeOriginCorsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static HttpRequestMessage Preflight(string origin, string method)
    {
        var request = new HttpRequestMessage(HttpMethod.Options, LoginPath);
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", method);
        request.Headers.Add("Access-Control-Request-Headers", "authorization,content-type");
        return request;
    }

    [Fact]
    public async Task Should_EchoAllowedOrigin_When_AndroidWebViewPreflightsLogin()
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(AndroidOrigin, "POST"),
            TestContext.Current.CancellationToken
        );

        Assert.Equal(
            AndroidOrigin,
            Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin"))
        );
    }

    [Fact]
    public async Task Should_EchoAllowedOrigin_When_IosWebViewPreflightsLogin()
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(IosOrigin, "POST"),
            TestContext.Current.CancellationToken
        );

        Assert.Equal(
            IosOrigin,
            Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin"))
        );
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("POST")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Should_AllowMethod_When_NativeClientPreflightsIt(string method)
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(AndroidOrigin, method),
            TestContext.Current.CancellationToken
        );

        Assert.Contains(
            method,
            Assert.Single(response.Headers.GetValues("Access-Control-Allow-Methods"))
        );
    }

    [Fact]
    public async Task Should_SendNoCorsHeaders_When_ForeignOriginPreflightsLogin()
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(ForeignOrigin, "POST"),
            TestContext.Current.CancellationToken
        );

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task Should_AllowAuthorizationHeader_When_NativeClientPreflightsLogin()
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(AndroidOrigin, "POST"),
            TestContext.Current.CancellationToken
        );

        Assert.Contains(
            "authorization",
            Assert.Single(response.Headers.GetValues("Access-Control-Allow-Headers")),
            StringComparison.OrdinalIgnoreCase
        );
    }

    [Fact]
    public async Task Should_NotAllowCredentials_When_NativeClientPreflightsLogin()
    {
        var client = _fixture.CreateClient();

        var response = await client.SendAsync(
            Preflight(AndroidOrigin, "POST"),
            TestContext.Current.CancellationToken
        );

        Assert.False(response.Headers.Contains("Access-Control-Allow-Credentials"));
    }
}
