using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class GetMeTests
{
    private readonly ApiTestFixture _fixture;

    public GetMeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnPersonAndMembership_When_ThePersonIsAMitglied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice", MembershipType.Youth, MembershipStatus.Paused)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), result.AccountId);
        Assert.Equal("Alice", result.Person.FirstName);
        Assert.Equal("Muster", result.Person.LastName);
        Assert.Equal(MembershipType.Youth, result.Membership?.Type);
        Assert.Equal(MembershipStatus.Paused, result.Membership?.Status);
    }

    [Fact]
    public async Task Should_ReturnNoMembership_When_ThePersonIsNotAMitglied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Membership);
        Assert.Equal(ctx.Identity.People.IdOf("alice"), result.Person.Id);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture.CreateClient().GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccessTokenHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        _fixture.TimeProvider.Advance(TimeSpan.FromMinutes(16));

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccessTokenSignatureIsTampered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );

        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", Tamper(session.AccessToken));

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static string Tamper(string accessToken) =>
        accessToken[..^1] + (accessToken[^1] == 'A' ? 'B' : 'A');
}
