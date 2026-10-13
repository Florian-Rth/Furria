using Furria.Application.Operations;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class SystemVerdictTests
{
    private const string AppVersion = "0.2.0+abc1234";

    private static readonly DateTimeOffset Now = new(2026, 10, 13, 12, 0, 0, TimeSpan.Zero);

    private static readonly SystemFacts Healthy = new()
    {
        CheckedAt = Now,
        App = new SystemAppDetails
        {
            Version = AppVersion,
            Environment = "Production",
            StartedAt = Now.AddHours(-1),
        },
        Database = new SystemDatabaseDetails
        {
            IsReachable = true,
            LatencyMs = 3,
            Version = "17.6",
            SizeBytes = 50_000_000,
            Connections = 8,
            MaxConnections = 100,
            LastMigration = "20261013084004_SystemStatus",
            PendingMigrations = 0,
            Tables = [],
        },
        Storage = new SystemStorageDetails
        {
            Volume = new StorageVolumeDetails { FreeBytes = 600, TotalBytes = 1000 },
            Survey = new StorageSurveyDetails
            {
                MeasuredAt = Now.AddMinutes(-30),
                CadenceSeconds = 6 * 3600,
                Originals = StorageTally.Empty,
                Renditions = StorageTally.Empty,
                Staging = StorageTally.Empty,
            },
        },
        Media = SystemMediaDetails.Unknown,
        Queue = MediaQueueDetails.Unknown,
        Workers = [Worker(lastSeenAt: Now.AddSeconds(-10), AppVersion)],
        Services = [Run(BackgroundJob.LogEntryPurge, lastRunAt: Now.AddMinutes(-5))],
        Mail = MailOutboxDetails.Unknown,
        ErrorsPerHour = new int[SystemFacts.ErrorHours],
        LogsSince = Now.AddDays(-3),
    };

    [Fact]
    public void Should_SayOk_When_EveryCheckIsHealthy()
    {
        var verdict = SystemVerdict.Of(Healthy);

        Assert.Equal(SystemLevel.Ok, verdict.Level);
        Assert.Empty(verdict.Reasons);
    }

    [Fact]
    public void Should_NameOnlyTheDatabase_When_ItIsUnreachable()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Database = SystemDatabaseDetails.Unreachable,
            }
        );

        Assert.Equal(SystemLevel.Broken, verdict.Level);
        var reason = Assert.Single(verdict.Reasons);
        Assert.Equal(SystemReasonCode.DatabaseUnreachable, reason.Code);
    }

    [Fact]
    public void Should_Break_When_MigrationsArePending()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Database = Healthy.Database with { PendingMigrations = 2 },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Broken, SystemReasonCode.PendingMigrations, 2);
    }

    [Fact]
    public void Should_AskForAttention_When_TheDatabaseAnswersSlowly()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Database = Healthy.Database with { LatencyMs = 250 },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.SlowDatabase, 250);
    }

    [Fact]
    public void Should_AskForAttention_When_AWorkerWentStale()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Workers =
                [
                    Worker(Now.AddSeconds(-10), AppVersion),
                    Worker(Now.AddSeconds(-60), AppVersion),
                ],
            }
        );

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.WorkerStale, 60);
    }

    [Fact]
    public void Should_Break_When_NoWorkerLivesWhileJobsWait()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Workers = [],
                Queue = MediaQueueDetails.Unknown with { Queued = 3, OldestQueuedAt = Now },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Broken, SystemReasonCode.NoLiveWorker, 3);
    }

    [Fact]
    public void Should_StayOk_When_NoWorkerLivesAndNothingWaits()
    {
        var verdict = SystemVerdict.Of(Healthy with { Workers = [] });

        Assert.Equal(SystemLevel.Ok, verdict.Level);
    }

    [Fact]
    public void Should_AskForAttention_When_ALiveWorkerRunsAnotherRelease()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Workers = [Worker(Now.AddSeconds(-5), "0.1.9+def5678")],
            }
        );

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.WorkerVersionMismatch);
    }

    [Theory]
    [InlineData("0.2.0")]
    [InlineData("0.2.0+def5678")]
    public void Should_StayOk_When_AWorkerRunsTheSameReleaseFromAnotherBuild(string version)
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Workers = [Worker(Now.AddSeconds(-5), version)],
            }
        );

        Assert.Equal(SystemLevel.Ok, verdict.Level);
    }

    [Theory]
    [InlineData(4, null)]
    [InlineData(6, SystemLevel.Attention)]
    [InlineData(31, SystemLevel.Broken)]
    public void Should_EscalateTheQueue_When_ItsOldestJobWaitsLonger(
        int minutesWaiting,
        SystemLevel? expected
    )
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Queue = MediaQueueDetails.Unknown with
                {
                    Queued = 1,
                    OldestQueuedAt = Now.AddMinutes(-minutesWaiting),
                },
            }
        );

        AssertLevelOf(verdict, SystemReasonCode.QueueWaiting, expected);
    }

    [Theory]
    [InlineData(20, null)]
    [InlineData(10, SystemLevel.Attention)]
    [InlineData(4, SystemLevel.Broken)]
    public void Should_EscalateTheDisk_When_ItsFreeShareShrinks(
        int freePercent,
        SystemLevel? expected
    )
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Storage = Healthy.Storage with
                {
                    Volume = new StorageVolumeDetails { FreeBytes = freePercent, TotalBytes = 100 },
                },
            }
        );

        AssertLevelOf(verdict, SystemReasonCode.DiskLow, expected);
    }

    [Fact]
    public void Should_AskForAttention_When_TheLastSurveyIsOlderThanThreeCadences()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Storage = Healthy.Storage with
                {
                    Survey = Healthy.Storage.Survey! with { MeasuredAt = Now.AddHours(-19) },
                },
            }
        );

        AssertSingleReason(
            verdict,
            SystemLevel.Attention,
            SystemReasonCode.StorageUnmeasured,
            19 * 3600
        );
    }

    [Fact]
    public void Should_WaitForTheFirstSurvey_When_TheHostStartedRecently()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Storage = Healthy.Storage with { Survey = null },
            }
        );

        Assert.Equal(SystemLevel.Ok, verdict.Level);
    }

    [Fact]
    public void Should_AskForAttention_When_MediaFailedToday()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Media = SystemMediaDetails.Unknown with { FailedInLastDay = 2 },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.MediaFailed, 2);
    }

    [Fact]
    public void Should_AskForAttention_When_AnErrorWasLoggedToday()
    {
        var errors = new int[SystemFacts.ErrorHours];
        errors[3] = 1;

        var verdict = SystemVerdict.Of(Healthy with { ErrorsPerHour = errors });

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.ErrorsLogged, 1);
    }

    [Fact]
    public void Should_Break_When_TwentyErrorsWereLoggedInTheLastHour()
    {
        var errors = new int[SystemFacts.ErrorHours];
        errors[^1] = 20;

        var verdict = SystemVerdict.Of(Healthy with { ErrorsPerHour = errors });

        Assert.Equal(SystemLevel.Broken, verdict.Level);
        Assert.Equal(SystemReasonCode.ErrorBurst, verdict.Reasons[0].Code);
    }

    [Theory]
    [InlineData(40, null)]
    [InlineData(50, SystemLevel.Attention)]
    [InlineData(100, SystemLevel.Broken)]
    public void Should_EscalateAService_When_ItIsOverdueLonger(
        int minutesSinceLastRun,
        SystemLevel? expected
    )
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Services =
                [
                    Run(
                        BackgroundJob.LogEntryPurge,
                        lastRunAt: Now.AddMinutes(-minutesSinceLastRun)
                    ),
                ],
            }
        );

        AssertLevelOf(verdict, SystemReasonCode.ServiceOverdue, expected);
    }

    [Fact]
    public void Should_LeaveAServiceAlone_When_ItIsStillRunning()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Services =
                [
                    Run(BackgroundJob.LogEntryPurge, lastRunAt: Now.AddHours(-3)) with
                    {
                        IsRunning = true,
                    },
                ],
            }
        );

        Assert.Equal(SystemLevel.Ok, verdict.Level);
    }

    [Theory]
    [InlineData(1, SystemLevel.Attention)]
    [InlineData(3, SystemLevel.Broken)]
    public void Should_EscalateAService_When_ItFailsAgainAndAgain(
        int failuresInARow,
        SystemLevel expected
    )
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Services =
                [
                    Run(BackgroundJob.MailDispatcher, lastRunAt: Now) with
                    {
                        LastFailure = "SmtpCommandException",
                        ConsecutiveFailures = failuresInARow,
                    },
                ],
            }
        );

        var reason = AssertSingleReason(verdict, expected, SystemReasonCode.ServiceFailed);
        Assert.Equal("mailDispatcher", reason.Subject);
    }

    [Fact]
    public void Should_AskForAttention_When_AMailIsRetrying()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Mail = new MailOutboxDetails
                {
                    Pending = 1,
                    Retrying = 1,
                    OldestPendingAt = Now.AddMinutes(-2),
                },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Attention, SystemReasonCode.MailRetrying, 1);
    }

    [Fact]
    public void Should_Break_When_AMailWaitsLongerThanAQuarterOfAnHour()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Mail = new MailOutboxDetails
                {
                    Pending = 1,
                    Retrying = 0,
                    OldestPendingAt = Now.AddMinutes(-16),
                },
            }
        );

        AssertSingleReason(verdict, SystemLevel.Broken, SystemReasonCode.MailStuck, 16 * 60);
    }

    [Fact]
    public void Should_PutTheWorstReasonFirst_When_SeveralRulesFire()
    {
        var verdict = SystemVerdict.Of(
            Healthy with
            {
                Database = Healthy.Database with { LatencyMs = 300 },
                Mail = new MailOutboxDetails
                {
                    Pending = 1,
                    Retrying = 0,
                    OldestPendingAt = Now.AddMinutes(-20),
                },
            }
        );

        Assert.Equal(SystemLevel.Broken, verdict.Level);
        Assert.Equal(
            [SystemReasonCode.MailStuck, SystemReasonCode.SlowDatabase],
            verdict.Reasons.Select(reason => reason.Code)
        );
    }

    private static SystemReason AssertSingleReason(
        SystemVerdictDetails verdict,
        SystemLevel level,
        SystemReasonCode code,
        double? value = null
    )
    {
        Assert.Equal(level, verdict.Level);
        var reason = Assert.Single(verdict.Reasons);
        Assert.Equal(code, reason.Code);
        Assert.Equal(level, reason.Level);
        if (value is not null)
            Assert.Equal(value, reason.Value);
        return reason;
    }

    private static void AssertLevelOf(
        SystemVerdictDetails verdict,
        SystemReasonCode code,
        SystemLevel? expected
    ) =>
        Assert.Equal(
            expected,
            verdict.Reasons.SingleOrDefault(reason => reason.Code == code)?.Level
        );

    private static MediaWorkerSummary Worker(DateTimeOffset lastSeenAt, string version) =>
        new()
        {
            InstanceId = Guid.NewGuid(),
            HostName = $"worker-{Guid.NewGuid():N}",
            Version = version,
            HardwareAcceleration = "none",
            StartedAt = Now.AddHours(-1),
            LastSeenAt = lastSeenAt,
            IsAlive = MediaWorkerLiveness.IsAlive(lastSeenAt, Now),
            PhotoMediaItemId = null,
            VideoMediaItemId = null,
        };

    private static BackgroundRunSummary Run(BackgroundJob job, DateTimeOffset lastRunAt)
    {
        var cadence = BackgroundJobSchedule.Every(job);
        return new BackgroundRunSummary
        {
            Job = job,
            CadenceSeconds = (int)cadence.TotalSeconds,
            LastRunAt = lastRunAt,
            LastFailure = null,
            ConsecutiveFailures = 0,
            NextDueAt = lastRunAt + cadence,
            IsRunning = false,
        };
    }
}
