using System.Net;
using System.Net.Http.Headers;
using Furria.Api.Tests.Auth;
using Furria.Application.Mail;
using Furria.Infrastructure.Mail;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Mail;

public sealed class MailOutboxTests : IClassFixture<ApiTestFixture>
{
    private const string RetryScheduled =
        "Mail {MailTemplate} to {MailRecipientKind} {MailRecipientId} failed on attempt {AttemptNumber} with {FailureType}, retrying in {RetryDelay}";
    private const string Abandoned =
        "Mail {MailTemplate} to {MailRecipientKind} {MailRecipientId} abandoned after {AttemptCount} attempts, last failure {FailureType}";
    private const string ClosedPort = "1";
    private const int LastAttempt = 7;

    private static readonly TimeSpan DispatchTimeout = TimeSpan.FromSeconds(20);

    private readonly ApiTestFixture _fixture;

    public MailOutboxTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_HoldTheNoticeInTheOutbox_When_ThePasswordChangeIsCommitted()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await HostWithoutMailServerAsync(ct);
        var annaEmail = await ApiTestFixture.SeedAccountOnAsync(host, "anna", ct);
        var anna = await SignedInClientAsync(host, annaEmail);

        var (response, _) = await AccountSecuritySteps.ChangePasswordAsync(
            anna,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var notice = Assert.Single(await ApiTestFixture.OutboxOfAsync(host, ct));
        Assert.Equal(MailTemplate.CredentialChangeNotice, notice.Template);
        Assert.Equal(annaEmail, notice.To);
    }

    [Fact]
    public async Task Should_KeepTheOldPassword_When_TheNoticeCannotBeStored()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await HostWithoutMailServerAsync(ct);
        var annaEmail = await ApiTestFixture.SeedAccountOnAsync(host, "anna", ct);
        var anna = await SignedInClientAsync(host, annaEmail);

        await using (await RejectedWrites.OnAsync(host, "outbox_mail", ct))
        {
            var (refused, _) = await AccountSecuritySteps.ChangePasswordAsync(
                anna,
                ApiTestFixture.SeededAccountPassword
            );
            Assert.Equal(HttpStatusCode.InternalServerError, refused.StatusCode);
        }

        var (login, _) = await SignInLimitSteps.LogInAsync(
            host.CreateClient(),
            annaEmail,
            ApiTestFixture.SeededAccountPassword
        );
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.Empty(await ApiTestFixture.OutboxOfAsync(host, ct));
    }

    [Fact]
    public async Task Should_ScheduleTheNextAttempt_When_TheMailServerIsUnreachable()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await HostWithoutMailServerAsync(ct);
        var mark = _fixture.Logs.Mark();

        await ApiTestFixture.StageOutboxMailAsync(host, Mail(attempt: 1), ct);

        var retried = await DispatchedAsync(host, mail => mail.Attempt == 2, ct);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddSeconds(5), retried.NextAttemptAt);
        var written = Assert.Single(_fixture.Logs.Written(RetryScheduled, mark));
        Assert.Equal(LogEventLevel.Warning, written.Level);
        Assert.Equal(1, written.ScalarOf("AttemptNumber"));
    }

    [Fact]
    public async Task Should_DropTheMail_When_ItsLastAttemptFails()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await HostWithoutMailServerAsync(ct);
        var mark = _fixture.Logs.Mark();

        await ApiTestFixture.StageOutboxMailAsync(host, Mail(LastAttempt), ct);

        await Polling.UntilAsync(
            async token =>
                (await ApiTestFixture.OutboxOfAsync(host, token)).Count == 0 ? host : null,
            DispatchTimeout,
            "The abandoned mail was never dropped",
            ct
        );
        var written = Assert.Single(_fixture.Logs.Written(Abandoned, mark));
        Assert.Equal(LogEventLevel.Warning, written.Level);
        Assert.Equal(LastAttempt, written.ScalarOf("AttemptCount"));
    }

    private Task<WebApplicationFactory<Program>> HostWithoutMailServerAsync(CancellationToken ct) =>
        _fixture.HostOnOwnDatabaseAsync(
            new Dictionary<string, string>
            {
                [$"{MailOptions.SectionName}:{nameof(MailOptions.Port)}"] = ClosedPort,
            },
            ct
        );

    private static async Task<HttpClient> SignedInClientAsync(
        WebApplicationFactory<Program> host,
        string loginEmail
    )
    {
        var (response, session) = await SignInLimitSteps.LogInAsync(
            host.CreateClient(),
            loginEmail,
            ApiTestFixture.SeededAccountPassword
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var client = host.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );
        return client;
    }

    private static Task<OutboxMail> DispatchedAsync(
        WebApplicationFactory<Program> host,
        Func<OutboxMail, bool> dispatched,
        CancellationToken ct
    ) =>
        Polling.UntilAsync(
            async token =>
                (await ApiTestFixture.OutboxOfAsync(host, token)).SingleOrDefault(dispatched),
            DispatchTimeout,
            "The dispatcher never attempted the mail",
            ct
        );

    private static OutboxMail Mail(int attempt) =>
        new()
        {
            Template = MailTemplate.PasswordReset,
            RecipientKind = MailRecipientKind.Person,
            RecipientId = 1,
            To = "outbox-retry@test.local",
            Subject = "Retry",
            TextBody = "Retry",
            HtmlBody = "<p>Retry</p>",
            Attempt = attempt,
        };
}
