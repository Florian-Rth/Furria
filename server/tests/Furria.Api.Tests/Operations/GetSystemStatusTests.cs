using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Operations;
using Furria.Application.Media;
using Furria.Application.Operations;
using Furria.Core.Media;
using Furria.Infrastructure.Mail;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class GetSystemStatusTests : IClassFixture<ApiTestFixture>
{
    private const long SeededItemBytes = 4096;

    private readonly ApiTestFixture _fixture;

    public GetSystemStatusTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportTheSchemaUpToDate_When_EveryMigrationIsApplied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.Database.IsReachable);
        Assert.Equal(0, result.Database.PendingMigrations);
        Assert.Equal(
            (await _fixture.GetAppliedMigrationsAsync(ct))[^1],
            result.Database.LastMigration
        );
        Assert.InRange(result.Database.Tables.Count, 1, 8);
        Assert.DoesNotContain(
            result.Verdict.Reasons,
            reason => reason.Check == SystemCheck.Database && reason.Level == SystemLevel.Broken
        );
    }

    [Fact]
    public async Task Should_CountMediaByKindAndState_When_TheGalleryHoldsItems()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddGalleryItem("first-photo")
                        .AddGalleryItem("second-photo")
                        .AddGalleryItem(
                            "broken-video",
                            kind: MediaKind.Video,
                            state: MediaItemState.Failed
                        )
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(
            [
                (MediaKind.Photo, MediaItemState.Ready, 2),
                (MediaKind.Video, MediaItemState.Failed, 1),
            ],
            result.Media.Counts.Select(count => (count.Kind, count.State, count.Count))
        );
        Assert.Equal(3 * SeededItemBytes, result.Media.TotalBytes);
        var failed = Assert.Single(result.Media.Failed);
        Assert.Equal(ctx.Gallery.Items.IdOf("broken-video"), failed.MediaItemId);
        Assert.Equal(MediaOwnerKind.Gallery, failed.OwnerKind);
        var reason = Assert.Single(
            result.Verdict.Reasons,
            reason => reason.Code == SystemReasonCode.MediaFailed
        );
        Assert.Equal(1, reason.Value);
    }

    [Fact]
    public async Task Should_Break_When_JobsWaitWithoutALiveWorker()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Gallery(gallery => gallery.AddGalleryItem("photo")),
            ct
        );
        await _fixture.RegenerateMediaAsync(
            new RegenerateMediaCommand { Scope = MediaRegenerationScope.All },
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(1, result.Queue.Queued);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), result.Queue.OldestQueuedAt);
        Assert.Equal(SystemLevel.Broken, result.Verdict.Level);
        Assert.Contains(
            result.Verdict.Reasons,
            reason => reason.Code == SystemReasonCode.NoLiveWorker && reason.Value == 1
        );
    }

    [Fact]
    public async Task Should_ShowALiveWorkerOfTheSameVersion_When_ItJustBeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.BeatAsMediaWorkerAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        var worker = Assert.Single(result.Workers);
        Assert.True(worker.IsAlive);
        Assert.Equal(result.App.Version, worker.Version);
        Assert.Equal("none", worker.HardwareAcceleration);
        Assert.DoesNotContain(
            result.Verdict.Reasons,
            reason => reason.Check == SystemCheck.Workers
        );
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
        await ApiTestFixture.StageOutboxMailAsync(
            _fixture,
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

    [Fact]
    public async Task Should_ListEveryBackgroundJob_When_TheHostRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        Assert.Equal(
            Enum.GetValues<BackgroundJob>(),
            result.Services.Select(service => service.Job)
        );
        var survey = result.Services.Single(service =>
            service.Job == BackgroundJob.MediaStorageSurvey
        );
        Assert.Equal(6 * 3600, survey.CadenceSeconds);
        var signedOut = result.Services.Single(service =>
            service.Job == BackgroundJob.SignedOutMailRequestWorker
        );
        Assert.Null(signedOut.CadenceSeconds);
        Assert.Null(signedOut.NextDueAt);
    }

    [Fact]
    public async Task Should_TallyTheMediaFolders_When_TheStorageWasSurveyed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Gallery(gallery => gallery.AddGalleryItem("photo")),
            ct
        );
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("photo"),
            MediaRendition.Small,
            new byte[100],
            ct
        );
        await _fixture.SurveyMediaStorageAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetSystemStatus, GetSystemStatusResponse>();

        var survey = result.Storage.Survey;
        Assert.NotNull(survey);
        Assert.Equal(1, survey.Renditions.Files);
        Assert.Equal(100, survey.Renditions.Bytes);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), survey.MeasuredAt);
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
