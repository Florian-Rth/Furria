using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class ResetPasswordTests
{
    private const string ResetField = "reset";
    private const string PasswordField = "password";
    private const string NoticeSubject = "Dein Zugang zur Vereins-App wurde geändert";
    private const string PasswordResetNotice = "über den Link „Passwort vergessen“";

    private readonly ApiTestFixture _fixture;

    public ResetPasswordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LetHerLogInWithTheNewPassword_When_TheResetLinkIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        var response = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var login = await ctx.Identity.LogInAsync(aliceEmail, SignedOutMailSteps.NewPassword, ct);
        Assert.NotEmpty(login.AccessToken);
        var (oldPassword, _) = await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new LoginRequest
                {
                    Email = aliceEmail,
                    Password = ApiTestFixture.SeededAccountPassword,
                }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, oldPassword.StatusCode);
    }

    [Fact]
    public async Task Should_EndEverySession_When_ThePasswordIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var session = await ctx.Identity.LogInAsync(
            aliceEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        var (refresh, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new RefreshRequest { RefreshToken = session.RefreshToken }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NotSignHerIn_When_ThePasswordIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(
            _fixture,
            ctx.Identity.EmailOf("alice"),
            ct
        );

        var response = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendTheCredentialChangeNotice_When_ThePasswordIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        var mails = await _fixture.Mailbox.MailsToAsync(aliceEmail, 2, ct);
        var notice = Assert.Single(mails, mail => mail.Subject == NoticeSubject);
        Assert.Contains(PasswordResetNotice, notice.Text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheResetLinkWasAlreadyUsed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(
            _fixture,
            ctx.Identity.EmailOf("alice"),
            ct
        );
        await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        var used = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            reset,
            "Noch-ein-Passwort-2026!"
        );
        var unknown = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            SignedOutMailSteps.UnknownReset()
        );

        Assert.Equal(HttpStatusCode.BadRequest, used.StatusCode);
        Assert.Equal(await RefusalOnAsync(unknown, ct), await RefusalOnAsync(used, ct));
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheAccountBecameTheManagingLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);
        await _fixture.DeleteAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);
        await _fixture.RunManagingLoginSeederAsync(
            new ManagingLoginOptions
            {
                Email = aliceEmail,
                Password = ApiTestFixture.SeededAccountPassword,
            },
            ct
        );

        var response = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);
        var unknown = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            SignedOutMailSteps.UnknownReset()
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(await RefusalOnAsync(unknown, ct), await RefusalOnAsync(response, ct));
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                aliceEmail,
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheResetLinkIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            SignedOutMailSteps.UnknownReset()
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ResetField, (await RefusalOnAsync(response, ct)).Field);
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheResetLinkIsTamperedWith()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddAccount("mallory")),
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(
            _fixture,
            ctx.Identity.EmailOf("mallory"),
            ct
        );
        var redirected = RedirectedTo(reset, ctx.Identity.Accounts.IdOf("alice"));

        var response = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            redirected
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ResetField, (await RefusalOnAsync(response, ct)).Field);
        var login = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        Assert.NotEmpty(login.AccessToken);
    }

    [Fact]
    public async Task Should_KeepTheLinkLive_When_TheNewPasswordHasSevenCharacters()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        var refused = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            reset,
            "kurzpw1"
        );
        var accepted = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        Assert.Equal(HttpStatusCode.BadRequest, refused.StatusCode);
        Assert.Equal(PasswordField, (await RefusalOnAsync(refused, ct)).Field);
        Assert.Equal(HttpStatusCode.NoContent, accepted.StatusCode);
    }

    [Fact]
    public async Task Should_LetHerLogIn_When_TheNewPasswordIsEightLowercaseLetters()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        var response = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            reset,
            "tanzbein"
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var login = await ctx.Identity.LogInAsync(aliceEmail, "tanzbein", ct);
        Assert.NotEmpty(login.AccessToken);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneResetLinkIsTriedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var reset = SignedOutMailSteps.UnknownReset();
        var client = _fixture.CreateClient();

        for (var attempt = 0; attempt < ApiTestFixture.PermitsPerInvitationToken; attempt++)
            Assert.Equal(
                HttpStatusCode.BadRequest,
                (await SignedOutMailSteps.ResetPasswordAsync(client, reset)).StatusCode
            );
        var refused = await SignedOutMailSteps.ResetPasswordAsync(client, reset);

        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
    }

    private static string RedirectedTo(string reset, int accountId)
    {
        var blob = Convert.FromBase64String(Padded(reset.Replace('-', '+').Replace('_', '/')));
        blob[0] = (byte)(accountId >> 24);
        blob[1] = (byte)(accountId >> 16);
        blob[2] = (byte)(accountId >> 8);
        blob[3] = (byte)accountId;

        return Convert.ToBase64String(blob).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string Padded(string base64) =>
        base64.PadRight(base64.Length + (4 - base64.Length % 4) % 4, '=');

    private static async Task<Refusal> RefusalOnAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.NotNull(payload);
        var (field, messages) = Assert.Single(payload.Errors);

        return new Refusal(field, Assert.Single(messages));
    }

    private sealed record Refusal(string Field, string Message);
}
