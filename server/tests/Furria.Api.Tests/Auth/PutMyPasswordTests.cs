using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class PutMyPasswordTests
{
    private const string CurrentPasswordField = "currentPassword";
    private const string NewPasswordField = "newPassword";
    private const string PasswordChangedLead = "wurde gerade geändert";

    private readonly ApiTestFixture _fixture;

    public PutMyPasswordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ChangeHerPassword_When_TheCurrentOneIsRight()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            client,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                AccountSecuritySteps.NewPassword
            )
        );
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_EndEveryEarlierSession_When_HerPasswordChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var phone = await LogInAsync(ctx, ct);
        var laptop = await LogInAsync(ctx, ct);

        await AccountSecuritySteps.ChangePasswordAsync(
            AccountSecuritySteps.ClientWith(_fixture, phone.AccessToken),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await AccountSecuritySteps.RefreshAsync(_fixture, laptop.RefreshToken)).StatusCode
        );
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await AccountSecuritySteps.RefreshAsync(_fixture, phone.RefreshToken)).StatusCode
        );
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerSignedIn_When_HerPasswordChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var phone = await LogInAsync(ctx, ct);

        var (_, fresh) = await AccountSecuritySteps.ChangePasswordAsync(
            AccountSecuritySteps.ClientWith(_fixture, phone.AccessToken),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(
            HttpStatusCode.OK,
            (await AccountSecuritySteps.RefreshAsync(_fixture, fresh.RefreshToken)).StatusCode
        );
        var (me, _) = await AccountSecuritySteps
            .ClientWith(_fixture, fresh.AccessToken)
            .GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
    }

    [Fact]
    public async Task Should_SendThePasswordChangedNotice_When_HerPasswordChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.ChangePasswordAsync(
            client,
            ApiTestFixture.SeededAccountPassword
        );

        var notice = await _fixture.Mailbox.SingleMailToAsync(ctx.Identity.EmailOf("anna"), ct);
        Assert.Equal(AccountSecuritySteps.NoticeSubject, notice.Subject);
        Assert.Contains(PasswordChangedLead, notice.Text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_RefuseOnTheCurrentPassword_When_ItIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var session = await LogInAsync(ctx, ct);

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            AccountSecuritySteps.ClientWith(_fixture, session.AccessToken),
            AccountSecuritySteps.WrongPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CurrentPasswordField, ct);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveActiveCount(1)
            .AssertAsync(ct);
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_LockHerOut_When_TheCurrentPasswordWasWrongFiveTimes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        for (var attempt = 0; attempt < AccountSecuritySteps.LockoutThreshold; attempt++)
            await AccountSecuritySteps.ChangePasswordAsync(
                client,
                AccountSecuritySteps.WrongPassword
            );

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            client,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CurrentPasswordField, ct);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_RefuseOnTheNewPassword_When_ItHasSevenCharacters()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            client,
            ApiTestFixture.SeededAccountPassword,
            "kurzpw1"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, NewPasswordField, ct);
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_ChangeHerPassword_When_TheNewOneIsEightLowercaseLetters()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            client,
            ApiTestFixture.SeededAccountPassword,
            "tanzbein"
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                "tanzbein"
            )
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            _fixture.CreateClient(),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> ArrangeAnnaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );

    private static Task<LoginResponse> LogInAsync(SeededContext ctx, CancellationToken ct) =>
        ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("anna"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
}
