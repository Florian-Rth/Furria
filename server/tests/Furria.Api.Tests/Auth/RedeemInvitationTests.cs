using System.Net;
using System.Net.Http.Headers;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class RedeemInvitationTests
{
    private readonly ApiTestFixture _fixture;

    public RedeemInvitationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SignHerIn_When_SheRedeemsTheMailedLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (response, session) = await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = _fixture.CreateClient();
        signedIn.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        Assert.Equal(annaEmail, me.Email);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(annaEmail)
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetHerLogInWithThePassword_When_SheRedeemedTheLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            ctx.Identity.People.IdOf("anna"),
            annaEmail,
            ct
        );

        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        var login = await ctx.Identity.LogInAsync(annaEmail, InvitationSteps.ValidPassword, ct);
        Assert.NotEmpty(login.AccessToken);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        HttpStatusCode status = default;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(14),
            async () =>
                status = (await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token))
                    .Response
                    .StatusCode
        );

        Assert.Equal(HttpStatusCode.Conflict, status);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationWasVoidedByANewerOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);
        await InvitationSteps.InviteAsync(manager, annaId);
        var mails = await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            mails[0].LinkToken()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationWasAlreadyRedeemed()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            ctx.Identity.People.IdOf("anna"),
            annaEmail,
            ct
        );
        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "Ein-Anderes-Passwort-1!"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheTokenIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            InvitationSteps.UnknownToken()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePasswordIsShorterThanTwelveCharacters()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "Kurz-1!"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheInvitationLive_When_IdentityRejectsThePassword()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (rejected, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "nurkleinbuchstaben"
        );
        var (accepted, _) = await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.BadRequest, rejected.StatusCode);
        Assert.Equal(HttpStatusCode.OK, accepted.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneTokenIsTriedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var token = InvitationSteps.UnknownToken();
        var client = _fixture.CreateClient();

        for (var attempt = 0; attempt < ApiTestFixture.PermitsPerInvitationToken; attempt++)
            await InvitationSteps.RedeemAsync(client, token);
        var (response, _) = await InvitationSteps.RedeemAsync(client, token);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }
}
