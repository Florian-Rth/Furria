using System.Buffers.Text;
using System.Net;
using System.Security.Cryptography;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class DeleteMyPasskeyByIdTests
{
    private readonly ApiTestFixture _fixture;

    public DeleteMyPasskeyByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveHerPasskey_When_ItIsHers()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);

        var response = await PasskeySteps.RemoveAsync(client, authenticator.PasskeyId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
        var (login, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }

    [Fact]
    public async Task Should_SendThePasskeyRemovedNotice_When_SheRemovedAPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);

        await PasskeySteps.RemoveAsync(client, authenticator.PasskeyId);

        var mails = await _fixture.Mailbox.MailsToAsync(ctx.Identity.EmailOf("anna"), 2, ct);
        var notice = Assert.Single(
            mails,
            mail => mail.Text.Contains(PasskeySteps.PasskeyRemovedLead, StringComparison.Ordinal)
        );
        Assert.Equal(AccountSecuritySteps.NoticeSubject, notice.Subject);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePasskeyIsSomeoneElses()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        var berta = await ctx.Identity.ClientForAsync("berta", ct);
        using var bertasAuthenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(berta, bertasAuthenticator);

        var response = await PasskeySteps.RemoveAsync(anna, bertasAuthenticator.PasskeyId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("berta"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_NoPasskeyHasTheId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var response = await PasskeySteps.RemoveAsync(
            client,
            Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(16))
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var response = await PasskeySteps.RemoveAsync(
            _fixture.CreateClient(),
            Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(16))
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> ArrangeAnnaAndBertaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddAccount("anna")
                        .AddPerson("berta", "Berta", "Beispiel")
                        .AddAccount("berta")
                ),
            ct
        );
}
