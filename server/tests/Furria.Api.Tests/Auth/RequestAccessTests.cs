using System.Net;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class RequestAccessTests
{
    private static readonly TimeSpan PastTheMailInterval =
        AccessRequestService.MailInterval + TimeSpan.FromSeconds(1);

    private readonly ApiTestFixture _fixture;

    public RequestAccessTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerIdentically_When_TheAddressMatchesMissesOrIsThrottled()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var carlEmail = InvitationSteps.UniqueContactEmail("carl");
        var doraEmail = InvitationSteps.UniqueContactEmail("dora");
        await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddPerson("carl", "Carl", "Muster")
                        .AddPersonContact("carl", carlEmail)
                        .AddMembership("carl-membership", "carl", _fixture.Today.AddYears(-1))
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact(
                            "dora",
                            doraEmail,
                            birthDate: _fixture.Today.AddYears(-30)
                        )
                ),
            ct
        );
        var client = _fixture.CreateClient();

        var match = await AnswerToAsync(client, annaEmail, ct);
        var miss = await AnswerToAsync(client, InvitationSteps.UniqueContactEmail("niemand"), ct);
        var ineligible = await AnswerToAsync(client, doraEmail, ct);
        var withoutBirthDate = await AnswerToAsync(client, carlEmail, ct);
        await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        var throttledRepeat = await AnswerToAsync(client, annaEmail, ct);

        Assert.Equal(HttpStatusCode.Accepted, match.Status);
        Assert.Empty(match.Body);
        Assert.Equal(match, miss);
        Assert.Equal(match, ineligible);
        Assert.Equal(match, withoutBirthDate);
        Assert.Equal(match, throttledRepeat);
    }

    [Fact]
    public async Task Should_IssueASelfRequestedInvitation_When_TheAddressIsHerContactEmail()
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

        var response = await SignedOutMailSteps.RequestAccessAsync(
            _fixture.CreateClient(),
            $"  {annaEmail.ToUpperInvariant()} "
        );

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        var mail = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        Assert.Single(mail.LinkTokens());
        await ctx
            .Expected.LiveInvitationOfPerson(annaId)
            .ToBeSelfRequested()
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerIn_When_SheRedeemsTheRequestedLink()
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
        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
        var mail = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            mail.LinkToken()
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        InvitationSteps.SignedInClient(_fixture, redemption);
        await ctx
            .Expected.AccountOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveLoginEmail(annaEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MailOneWorkingLinkPerEligiblePerson_When_TheyShareAnInbox()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("ben", "Ben", sharedEmail, _fixture.Today)
                        .AddEligiblePerson("anna", "Anna", sharedEmail, _fixture.Today)
                        .AddPerson("carl", "Carl", "Muster")
                        .AddPersonContact("carl", sharedEmail)
                        .AddMembership("carl-membership", "carl", _fixture.Today.AddYears(-1))
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var benId = ctx.Identity.People.IdOf("ben");

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), sharedEmail);

        var mail = await _fixture.Mailbox.SingleMailToAsync(sharedEmail, ct);
        var tokens = mail.LinkTokens();
        Assert.Equal(2, tokens.Count);
        Assert.Contains("Für Anna: ", mail.Text, StringComparison.Ordinal);
        Assert.Contains("Für Ben: ", mail.Text, StringComparison.Ordinal);
        Assert.DoesNotContain("Carl", mail.Text, StringComparison.Ordinal);

        var (firstResponse, firstRedemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            tokens[0]
        );
        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        InvitationSteps.SignedInClient(_fixture, firstRedemption);

        var ownEmail = InvitationSteps.UniqueContactEmail("eigene");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            tokens[1],
            ownEmail,
            ct
        );
        var (secondResponse, secondRedemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            tokens[1],
            loginEmail: ownEmail,
            confirmationCode: code
        );
        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);
        InvitationSteps.SignedInClient(_fixture, secondRedemption);

        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(sharedEmail)
            .AccountOfPerson(benId)
            .ToHaveLoginEmail(ownEmail)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("carl"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_VoidTheManagersInvitation_When_SheRequestsHerOwn()
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
        var managersToken = (await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct)).LinkToken();

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
        await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);

        var (_, lookup) = await InvitationSteps.LookUpAsync(_fixture.CreateClient(), managersToken);
        Assert.Equal(InvitationLookupStatus.Dead, lookup.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCountOn(InvitationChannel.Request, 1)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Invited)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothing_When_ThePersonHasNoBirthDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var carlEmail = InvitationSteps.UniqueContactEmail("carl");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("carl", "Carl", "Muster")
                        .AddPersonContact("carl", carlEmail)
                        .AddMembership("carl-membership", "carl", _fixture.Today.AddYears(-1))
                        .AddAccount("sentinel")
                ),
            ct
        );

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), carlEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, carlEmail, ct));
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("carl"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothing_When_ThePersonIsNotInTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var doraEmail = InvitationSteps.UniqueContactEmail("dora");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact(
                            "dora",
                            doraEmail,
                            birthDate: _fixture.Today.AddYears(-30)
                        )
                        .AddAccount("sentinel")
                ),
            ct
        );

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), doraEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, doraEmail, ct));
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("dora"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothing_When_ThePersonIsYoungerThanTheAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var emmaEmail = InvitationSteps.UniqueContactEmail("emma");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("emma", "Emma", "Muster")
                        .AddPersonContact(
                            "emma",
                            emmaEmail,
                            birthDate: _fixture.Today.AddYears(-10)
                        )
                        .AddMembership("emma-membership", "emma", _fixture.Today.AddYears(-1))
                        .AddAccount("sentinel")
                ),
            ct
        );

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), emmaEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, emmaEmail, ct));
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("emma"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothing_When_ThePersonAlreadyHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var finnEmail = InvitationSteps.UniqueContactEmail("finn");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("finn", "Finn", finnEmail, _fixture.Today)
                        .AddAccount("finn")
                        .AddAccount("sentinel")
                ),
            ct
        );

        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), finnEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, finnEmail, ct));
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("finn"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendOneMail_When_TheAddressIsRequestedAgainWithinFiveMinutes()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddAccount("sentinel")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
        await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);

        await _fixture.AtLaterTimeAsync(
            AccessRequestService.MailInterval - TimeSpan.FromSeconds(1),
            async () =>
            {
                await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
                await SignedOutMailSteps.SettleAsync(
                    _fixture,
                    ctx.Identity.EmailOf("sentinel"),
                    ct
                );
            }
        );

        Assert.Single(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, annaEmail, ct));
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothingToAnyoneOfTheInbox_When_ASharedAddressIsRequestedAgainWithinFiveMinutes()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", sharedEmail, _fixture.Today)
                        .AddEligiblePerson("ben", "Ben", sharedEmail, _fixture.Today)
                        .AddAccount("sentinel")
                ),
            ct
        );
        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), sharedEmail);
        await _fixture.Mailbox.SingleMailToAsync(sharedEmail, ct);

        await _fixture.AtLaterTimeAsync(
            AccessRequestService.MailInterval - TimeSpan.FromSeconds(1),
            async () =>
            {
                await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), sharedEmail);
                await SignedOutMailSteps.SettleAsync(
                    _fixture,
                    ctx.Identity.EmailOf("sentinel"),
                    ct
                );
            }
        );

        Assert.Single(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, sharedEmail, ct));
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("ben"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MailAgain_When_FiveMinutesHavePassed()
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
        await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
        var first = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);

        await _fixture.AtLaterTimeAsync(
            PastTheMailInterval,
            async () =>
            {
                await SignedOutMailSteps.RequestAccessAsync(_fixture.CreateClient(), annaEmail);
                await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);
            }
        );

        var (_, lookup) = await InvitationSteps.LookUpAsync(
            _fixture.CreateClient(),
            first.LinkToken()
        );
        Assert.Equal(InvitationLookupStatus.Dead, lookup.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneAddressIsRequestedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var address = InvitationSteps.UniqueContactEmail("niemand");
        var client = _fixture.CreateClient();
        var permits = new SignedOutRateLimitOptions().PermitsPerAddress;

        for (var attempt = 0; attempt < permits; attempt++)
            Assert.Equal(
                HttpStatusCode.Accepted,
                (await SignedOutMailSteps.RequestAccessAsync(client, address)).StatusCode
            );
        var refused = await SignedOutMailSteps.RequestAccessAsync(client, address);

        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheAddressIsNoEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await SignedOutMailSteps.RequestAccessAsync(
            _fixture.CreateClient(),
            "keine-adresse"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static async Task<SignedOutMailSteps.AnswerFingerprint> AnswerToAsync(
        HttpClient client,
        string email,
        CancellationToken ct
    ) =>
        await SignedOutMailSteps.FingerprintOfAsync(
            await SignedOutMailSteps.RequestAccessAsync(client, email),
            ct
        );
}
