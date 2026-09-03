using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class EndpointAuthorizationTests
{
    private readonly ApiTestFixture _fixture;

    public EndpointAuthorizationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoBerechtigung()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnOk_When_AnEndpointDeclaresNoBerechtigungAndAllowsAnonymous()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture.CreateClient().GETAsync<GetHealth, GetHealthResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
