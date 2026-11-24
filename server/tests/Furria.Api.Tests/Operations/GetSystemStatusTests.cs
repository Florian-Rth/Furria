using FastEndpoints;
using Furria.Api.Endpoints.Operations;
using Furria.Application.Operations;
using Furria.Infrastructure.Mail;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class GetSystemStatusTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetSystemStatusTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CallAWorkerStale_When_ItStoppedBeating()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.BeatAsMediaWorkerAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        GetSystemStatusResponse? result = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
                (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>()
        );

        Assert.False(Assert.Single(result!.Workers).IsAlive);
        var reason = Assert.Single(
            result.Verdict.Reasons,
            reason => reason.Code == SystemReasonCode.WorkerStale
        );
        Assert.Equal(SystemLevel.Attention, reason.Level);
        Assert.Equal(60, reason.Value);
    }

    [Fact]
    public async Task Should_ReportRetryingAndStuckMail_When_AMailFailedLongAgo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var now = _fixture.TimeProvider.GetUtcNow();
        await _fixture.StageOutboxMailAsync(
            new OutboxMail
            {
                Template = MailTemplate.PasswordReset,
                RecipientKind = MailRecipientKind.Person,
                RecipientId = 1,
                To = $"stuck-{Guid.NewGuid():N}@web.test",
                Subject = "Neues Passwort",
                TextBody = "",
                HtmlBody = "",
                Attempt = 2,
                NextAttemptAt = now.AddHours(1),
                EnqueuedAt = now.AddMinutes(-20),
            },
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(1, result.Mail.Pending);
        Assert.Equal(1, result.Mail.Retrying);
        Assert.Equal(now.AddMinutes(-20), result.Mail.OldestPendingAt);
        Assert.Contains(
            result.Verdict.Reasons,
            reason =>
                reason.Code == SystemReasonCode.MailStuck && reason.Level == SystemLevel.Broken
        );
        Assert.Contains(
            result.Verdict.Reasons,
            reason => reason.Code == SystemReasonCode.MailRetrying
        );
    }

    [Fact]
    public async Task Should_CountErrorsIntoTheirHours_When_ErrorsWereLogged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var now = _fixture.TimeProvider.GetUtcNow();
        await LogAsync(LogEntryLevel.Error, now.AddMinutes(-30), ct);
        await LogAsync(LogEntryLevel.Error, now.AddMinutes(-40), ct);
        await LogAsync(LogEntryLevel.Warning, now.AddMinutes(-30), ct);
        await LogAsync(LogEntryLevel.Fatal, now.AddHours(-5).AddMinutes(-10), ct);
        await LogAsync(LogEntryLevel.Error, now.AddHours(-30), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(SystemFacts.ErrorHours, result.ErrorsPerHour.Count);
        Assert.Equal(2, result.ErrorsPerHour[^1]);
        Assert.Equal(1, result.ErrorsPerHour[^6]);
        Assert.Equal(3, result.ErrorsPerHour.Sum());
        Assert.True(result.LogsSince <= now.AddHours(-30));
        var reason = Assert.Single(
            result.Verdict.Reasons,
            reason => reason.Code == SystemReasonCode.ErrorsLogged
        );
        Assert.Equal(3, reason.Value);
    }

    private Task LogAsync(LogEntryLevel level, DateTimeOffset loggedAt, CancellationToken ct) =>
        _fixture.WriteLogEntryDirectlyAsync(
            LogSource.Api,
            level,
            loggedAt,
            $"Seeded {level} at {loggedAt:O}",
            ct: ct
        );
}
