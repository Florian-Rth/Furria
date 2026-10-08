using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LogoutEverywhereTests
{
    private readonly ApiTestFixture _fixture;

    public LogoutEverywhereTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseEveryOldRefreshToken_When_SheLoggedOutEverywhere()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var phone = await LogInAsync(ctx, "anna", ct);
        var laptop = await LogInAsync(ctx, "anna", ct);

        var response = await PostAsync(phone.AccessToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await AccountSecuritySteps.RefreshAsync(_fixture, phone.RefreshToken)).StatusCode
        );
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await AccountSecuritySteps.RefreshAsync(_fixture, laptop.RefreshToken)).StatusCode
        );
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveOtherAccountsSignedIn_When_SheLoggedOutEverywhere()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna").AddAccount("bert")),
            ct
        );
        var anna = await LogInAsync(ctx, "anna", ct);
        var bert = await LogInAsync(ctx, "bert", ct);

        await PostAsync(anna.AccessToken);

        Assert.Equal(
            HttpStatusCode.OK,
            (await AccountSecuritySteps.RefreshAsync(_fixture, bert.RefreshToken)).StatusCode
        );
    }

    private async Task<HttpResponseMessage> PostAsync(string accessToken) =>
        (
            await AccountSecuritySteps
                .ClientWith(_fixture, accessToken)
                .POSTAsync<LogoutEverywhere, EmptyResponse>()
        ).Response;

    private static Task<LoginResponse> LogInAsync(
        SeededContext ctx,
        string alias,
        CancellationToken ct
    ) =>
        ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf(alias),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
}
