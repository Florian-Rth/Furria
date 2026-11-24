using System.Net;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class LookUpInvitationTests : IClassFixture<ApiTestFixture>
{
    private const string DeadBody =
        """{"status":"dead","firstName":null,"loginEmail":null,"contactEmailTaken":null,"purpose":null,"claimableLoginEmail":null}""";

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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var first = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var body = await LookUpRawByCodeAsync(first.Code, ct);

        Assert.Equal(DeadBody, body);
    }

    [Fact]
    public async Task Should_OfferTheClaim_When_HerContactEmailIsTheLoginOfAnAccountOutsideTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddStrayWithAccount("stray", "Anna")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var strayEmail = ctx.Identity.EmailOf("stray");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await ClaimSteps.GiveContactEmailAsync(manager, annaId, "Anna", strayEmail, birthDate);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            strayEmail,
            ct
        );

        var (response, result) = await InvitationSteps.LookUpAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(InvitationLookupStatus.Live, result.Status);
        Assert.Null(result.LoginEmail);
        Assert.True(result.ContactEmailTaken);
        Assert.Equal(strayEmail, result.ClaimableLoginEmail);
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
