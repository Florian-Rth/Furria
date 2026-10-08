using System.Net;
using Furria.Api.RateLimiting;
using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class RequestPasswordResetTests : IClassFixture<ApiTestFixture>
{
    private const string ResetSubject = "Neues Passwort für die Vereins-App";

    private readonly ApiTestFixture _fixture;

    public RequestPasswordResetTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerIdentically_When_TheLoginEmailIsKnownUnknownDisabledOrThrottled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddAccount("bruno", disabled: true)
                ),
            ct
        );
        var client = _fixture.CreateClient();
        var aliceEmail = ctx.Identity.EmailOf("alice");

        var known = await AnswerToAsync(client, aliceEmail, ct);
        var unknown = await AnswerToAsync(
            client,
            InvitationSteps.UniqueContactEmail("niemand"),
            ct
        );
        var disabled = await AnswerToAsync(client, ctx.Identity.EmailOf("bruno"), ct);
        await _fixture.Mailbox.SingleMailToAsync(aliceEmail, ct);
        var throttledRepeat = await AnswerToAsync(client, aliceEmail, ct);

        Assert.Equal(HttpStatusCode.Accepted, known.Status);
        Assert.Empty(known.Body);
        Assert.Equal(known, unknown);
        Assert.Equal(known, disabled);
        Assert.Equal(known, throttledRepeat);
    }

    [Fact]
    public async Task Should_MailAResetLink_When_TheLoginEmailBelongsToAnEnabledAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");

        var response = await SignedOutMailSteps.RequestPasswordResetAsync(
            _fixture.CreateClient(),
            $" {aliceEmail.ToUpperInvariant()}  "
        );

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        var mail = await _fixture.Mailbox.SingleMailToAsync(aliceEmail, ct);
        Assert.Equal(ResetSubject, mail.Subject);
        Assert.StartsWith(
            SignedOutMailSteps.ResetLinkPrefix,
            mail.Link(),
            StringComparison.Ordinal
        );
        Assert.DoesNotContain(aliceEmail, mail.Link(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Should_KeepTheKeyThatProtectsTheResetTokenInTheDatabase_When_AResetLinkIsMailed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await SignedOutMailSteps.RequestResetAndReadItAsync(
            _fixture,
            ctx.Identity.EmailOf("alice"),
            ct
        );

        await ctx.Expected.DataProtectionKeys().ToHoldAKey().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothing_When_TheAddressIsOnlyAContactEmail()
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

        await SignedOutMailSteps.RequestPasswordResetAsync(_fixture.CreateClient(), annaEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, annaEmail, ct));
    }

    [Fact]
    public async Task Should_SendNothing_When_TheAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("bruno", disabled: true).AddAccount("sentinel")
                ),
            ct
        );
        var brunoEmail = ctx.Identity.EmailOf("bruno");

        await SignedOutMailSteps.RequestPasswordResetAsync(_fixture.CreateClient(), brunoEmail);
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, brunoEmail, ct));
    }

    [Fact]
    public async Task Should_SendNothing_When_TheAddressIsTheManagingLogins()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("sentinel")),
            ct
        );

        await SignedOutMailSteps.RequestPasswordResetAsync(
            _fixture.CreateClient(),
            ApiTestFixture.ManagingLoginEmail
        );
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(
            await SignedOutMailSteps.MailsAlreadyInAsync(
                _fixture,
                ApiTestFixture.ManagingLoginEmail,
                ct
            )
        );
    }

    [Fact]
    public async Task Should_SendOneMail_When_TheLoginEmailIsRequestedAgainWithinFiveMinutes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddAccount("sentinel")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        await SignedOutMailSteps.RequestPasswordResetAsync(_fixture.CreateClient(), aliceEmail);
        await _fixture.Mailbox.SingleMailToAsync(aliceEmail, ct);

        await _fixture.AtLaterTimeAsync(
            PasswordResetMailThrottle.Interval - TimeSpan.FromSeconds(1),
            async () =>
            {
                await SignedOutMailSteps.RequestPasswordResetAsync(
                    _fixture.CreateClient(),
                    aliceEmail
                );
                await SignedOutMailSteps.SettleAsync(
                    _fixture,
                    ctx.Identity.EmailOf("sentinel"),
                    ct
                );
            }
        );

        Assert.Single(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, aliceEmail, ct));
    }

    [Fact]
    public async Task Should_MailAgain_When_FiveMinutesHavePassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        await SignedOutMailSteps.RequestPasswordResetAsync(_fixture.CreateClient(), aliceEmail);
        await _fixture.Mailbox.SingleMailToAsync(aliceEmail, ct);

        await _fixture.AtLaterTimeAsync(
            PasswordResetMailThrottle.Interval + TimeSpan.FromSeconds(1),
            async () =>
            {
                await SignedOutMailSteps.RequestPasswordResetAsync(
                    _fixture.CreateClient(),
                    aliceEmail
                );
                var mails = await _fixture.Mailbox.MailsToAsync(aliceEmail, 2, ct);
                Assert.Equal(2, mails.Count);
            }
        );
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
                (await SignedOutMailSteps.RequestPasswordResetAsync(client, address)).StatusCode
            );
        var refused = await SignedOutMailSteps.RequestPasswordResetAsync(client, address);

        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
    }

    private static async Task<SignedOutMailSteps.AnswerFingerprint> AnswerToAsync(
        HttpClient client,
        string email,
        CancellationToken ct
    ) =>
        await SignedOutMailSteps.FingerprintOfAsync(
            await SignedOutMailSteps.RequestPasswordResetAsync(client, email),
            ct
        );
}
