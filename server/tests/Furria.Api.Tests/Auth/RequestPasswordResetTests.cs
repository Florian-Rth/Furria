using System.Net;
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
