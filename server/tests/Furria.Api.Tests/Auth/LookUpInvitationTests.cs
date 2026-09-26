using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LookUpInvitationTests
{
    private const string DeadBody =
        """{"status":"dead","firstName":null,"loginEmail":null,"contactEmailTaken":null}""";

    private readonly ApiTestFixture _fixture;

    public LookUpInvitationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NameHerAndHerLoginEmail_When_TheInvitationIsLive()
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

        var (response, result) = await InvitationSteps.LookUpAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(InvitationLookupStatus.Live, result.Status);
        Assert.Equal("Anna", result.FirstName);
        Assert.Equal(annaEmail, result.LoginEmail);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheTokenIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var body = await LookUpRawAsync(InvitationSteps.UnknownToken(), ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheTokenIsNotEvenWellFormed()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var body = await LookUpRawAsync("not-a-token", ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheInvitationHasExpired()
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

        var body = "";
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(15),
            async () => body = await LookUpRawAsync(token, ct)
        );

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheInvitationWasVoided()
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

        var body = await LookUpRawAsync(mails[0].LinkToken(), ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheInvitationWasRedeemed()
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

        var body = await LookUpRawAsync(token, ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_SheLeftTheClubAfterTheInvitation()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            annaEmail,
                            birthDate: _fixture.Today.AddYears(-30)
                        )
                        .AddMembership(
                            "anna-membership",
                            "anna",
                            _fixture.Today.AddYears(-1),
                            _fixture.Today.AddDays(3)
                        )
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

        var body = "";
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(7),
            async () => body = await LookUpRawAsync(token, ct)
        );

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneTokenIsLookedUpTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var token = InvitationSteps.UnknownToken();
        var client = _fixture.CreateClient();

        for (var attempt = 0; attempt < ApiTestFixture.PermitsPerInvitationToken; attempt++)
            await InvitationSteps.LookUpAsync(client, token);
        var (response, _) = await InvitationSteps.LookUpAsync(client, token);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Should_NameHerAndHerLoginEmail_When_SheTypesTheInPersonCodeLoosely()
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
        var issued = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("anna")
        );
        var typed = issued.Code.ToLowerInvariant().Replace('-', ' ');

        var (response, result) = await InvitationSteps.LookUpByCodeAsync(
            _fixture.CreateClient(),
            typed
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(InvitationLookupStatus.Live, result.Status);
        Assert.Equal("Anna", result.FirstName);
        Assert.Equal(annaEmail, result.LoginEmail);
        Assert.False(result.ContactEmailTaken);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheCodeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var body = await LookUpRawByCodeAsync(InvitationSteps.UnknownCode(), ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheCodeUsesCharactersOutsideTheAlphabet()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var body = await LookUpRawByCodeAsync("O0I1-L0O1", ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheInPersonCodeHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("anna")
        );

        var body = "";
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () => body = await LookUpRawByCodeAsync(issued.Code, ct)
        );

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_AnswerOnlyDead_When_TheCodeWasReplacedByANewerOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var first = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var body = await LookUpRawByCodeAsync(first.Code, ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_LeaveTheLoginEmailOpen_When_HerContactEmailIsAlreadySomeonesLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("bruno", "Bruno", sharedEmail, _fixture.Today)
                        .AddEligiblePerson("anna", "Anna", sharedEmail, _fixture.Today)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var brunoIssued = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("bruno")
        );
        await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), brunoIssued.Code);
        var annaIssued = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("anna")
        );

        var (response, result) = await InvitationSteps.LookUpByCodeAsync(
            _fixture.CreateClient(),
            annaIssued.Code
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(InvitationLookupStatus.Live, result.Status);
        Assert.Equal("Anna", result.FirstName);
        Assert.Null(result.LoginEmail);
        Assert.True(result.ContactEmailTaken);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneCodeIsTriedTooOftenInAnySpelling()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var code = InvitationSteps.UnknownCode();
        string[] spellings = [code, code.ToLowerInvariant(), code.Replace('-', ' ')];

        for (var attempt = 0; attempt < ApiTestFixture.PermitsPerInvitationToken; attempt++)
            await InvitationSteps.LookUpByCodeAsync(client, spellings[attempt % spellings.Length]);
        var (response, _) = await InvitationSteps.LookUpByCodeAsync(
            client,
            code.Replace("-", "", StringComparison.Ordinal).ToLowerInvariant()
        );

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_BothTheTokenAndTheCodeAreGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<LookUpInvitation, LookUpInvitationRequest, LookUpInvitationResponse>(
                new LookUpInvitationRequest
                {
                    Token = InvitationSteps.UnknownToken(),
                    Code = InvitationSteps.UnknownCode(),
                }
            );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_NeitherTheTokenNorTheCodeIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<LookUpInvitation, LookUpInvitationRequest, LookUpInvitationResponse>(
                new LookUpInvitationRequest()
            );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<string> LookUpRawByCodeAsync(string code, CancellationToken ct)
    {
        var (response, _) = await InvitationSteps.LookUpByCodeAsync(_fixture.CreateClient(), code);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadAsStringAsync(ct);
    }

    private async Task<string> LookUpRawAsync(string token, CancellationToken ct)
    {
        var (response, _) = await InvitationSteps.LookUpAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadAsStringAsync(ct);
    }
}
