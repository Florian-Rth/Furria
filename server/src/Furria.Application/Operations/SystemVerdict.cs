using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Application.Operations;

public static class SystemVerdict
{
    private const int SlowDatabaseMs = 200;
    private const double LowDiskPercent = 15;
    private const double CriticalDiskPercent = 5;
    private const int SurveyStaleCadences = 3;
    private const int ErrorBurstPerHour = 20;
    private const int OverdueCadences = 2;
    private const int FarOverdueCadences = 5;
    private const int FailuresInARowToBreak = 3;

    private static readonly TimeSpan QueueWaitingAfter = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan QueueStuckAfter = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MailStuckAfter = TimeSpan.FromMinutes(15);

    [Pure]
    private static IEnumerable<SystemReason> DatabaseReasons(SystemDatabaseDetails database)
    {
        if (!database.IsReachable)
        {
            yield return Broken(SystemCheck.Database, SystemReasonCode.DatabaseUnreachable);
            yield break;
        }

        if (database.PendingMigrations is > 0 and var pending)
            yield return Broken(SystemCheck.Database, SystemReasonCode.PendingMigrations, pending);

        if (database.LatencyMs is > SlowDatabaseMs and var latency)
            yield return Attention(SystemCheck.Database, SystemReasonCode.SlowDatabase, latency);
    }

    [Pure]
    private static IEnumerable<SystemReason> WorkerReasons(SystemFacts facts)
    {
        foreach (var stale in facts.Workers.Where(worker => !worker.IsAlive))
            yield return Attention(
                SystemCheck.Workers,
                SystemReasonCode.WorkerStale,
                SecondsBetween(stale.LastSeenAt, facts.CheckedAt),
                stale.HostName
            );

        var live = facts.Workers.Where(worker => worker.IsAlive).ToList();
        if (live.Count == 0 && facts.Queue.HoldsJobs)
            yield return Broken(
                SystemCheck.Workers,
                SystemReasonCode.NoLiveWorker,
                facts.Queue.Queued + facts.Queue.Running + facts.Queue.Retrying
            );

        var release = ReleaseOf(facts.App.Version);
        foreach (var foreign in live.Where(worker => ReleaseOf(worker.Version) != release))
            yield return Attention(
                SystemCheck.Workers,
                SystemReasonCode.WorkerVersionMismatch,
                subject: foreign.HostName
            );
    }

    [Pure]
    private static string ReleaseOf(string version) => version.Split('+')[0];

    [Pure]
    private static IEnumerable<SystemReason> QueueReasons(
        MediaQueueDetails queue,
        DateTimeOffset checkedAt
    )
    {
        if (queue.OldestQueuedAt is not { } oldest)
            yield break;

        var waited = checkedAt - oldest;
        if (waited > QueueStuckAfter)
            yield return Broken(
                SystemCheck.Queue,
                SystemReasonCode.QueueWaiting,
                Math.Round(waited.TotalSeconds)
            );
        else if (waited > QueueWaitingAfter)
            yield return Attention(
                SystemCheck.Queue,
                SystemReasonCode.QueueWaiting,
                Math.Round(waited.TotalSeconds)
            );
    }

    [Pure]
    private static IEnumerable<SystemReason> StorageReasons(SystemFacts facts)
    {
        if (facts.Storage.Volume is { TotalBytes: > 0 } volume)
        {
            var freePercent = Math.Round(100.0 * volume.FreeBytes / volume.TotalBytes, 1);
            if (freePercent < CriticalDiskPercent)
                yield return Broken(SystemCheck.Storage, SystemReasonCode.DiskLow, freePercent);
            else if (freePercent < LowDiskPercent)
                yield return Attention(SystemCheck.Storage, SystemReasonCode.DiskLow, freePercent);
        }

        if (IsSurveyStale(facts))
            yield return Attention(
                SystemCheck.Storage,
                SystemReasonCode.StorageUnmeasured,
                facts.Storage.Survey is { } survey
                    ? SecondsBetween(survey.MeasuredAt, facts.CheckedAt)
                    : null
            );
    }

    [Pure]
    private static bool IsSurveyStale(SystemFacts facts)
    {
        var cadence = BackgroundJobSchedule.Every(BackgroundJob.MediaStorageSurvey);
        var measuredAt =
            facts.Storage.Survey?.MeasuredAt
            ?? facts.App.StartedAt
                + BackgroundJobSchedule.FirstRunDelayOf(BackgroundJob.MediaStorageSurvey);
        return facts.CheckedAt - measuredAt > cadence * SurveyStaleCadences;
    }

    [Pure]
    private static IEnumerable<SystemReason> MediaReasons(SystemMediaDetails media)
    {
        if (media.FailedInLastDay > 0)
            yield return Attention(
                SystemCheck.Media,
                SystemReasonCode.MediaFailed,
                media.FailedInLastDay
            );
    }

    [Pure]
    private static IEnumerable<SystemReason> LogReasons(IReadOnlyList<int> errorsPerHour)
    {
        if (errorsPerHour.Count > 0 && errorsPerHour[^1] >= ErrorBurstPerHour)
            yield return Broken(SystemCheck.Logs, SystemReasonCode.ErrorBurst, errorsPerHour[^1]);

        var errorsInADay = errorsPerHour.Sum();
        if (errorsInADay > 0)
            yield return Attention(SystemCheck.Logs, SystemReasonCode.ErrorsLogged, errorsInADay);
    }

    [Pure]
    private static IEnumerable<SystemReason> ServiceReasons(
        BackgroundRunSummary run,
        DateTimeOffset checkedAt
    )
    {
        var job = JobKeyOf(run.Job);

        if (OverdueOf(run, checkedAt) is { } overdue)
            yield return overdue.Cadences > FarOverdueCadences
                ? Broken(
                    SystemCheck.Services,
                    SystemReasonCode.ServiceOverdue,
                    overdue.Seconds,
                    job
                )
                : Attention(
                    SystemCheck.Services,
                    SystemReasonCode.ServiceOverdue,
                    overdue.Seconds,
                    job
                );

        if (run.ConsecutiveFailures >= FailuresInARowToBreak)
            yield return Broken(
                SystemCheck.Services,
                SystemReasonCode.ServiceFailed,
                run.ConsecutiveFailures,
                job
            );
        else if (run.LastFailure is not null)
            yield return Attention(
                SystemCheck.Services,
                SystemReasonCode.ServiceFailed,
                run.ConsecutiveFailures,
                job
            );
    }

    [Pure]
    private static Overdue? OverdueOf(BackgroundRunSummary run, DateTimeOffset checkedAt)
    {
        if (run.IsRunning || run.CadenceSeconds is not > 0 || run.NextDueAt is not { } dueAt)
            return null;

        var overdueSeconds = Math.Round((checkedAt - dueAt).TotalSeconds);
        var cadences = overdueSeconds / run.CadenceSeconds.Value;
        return cadences > OverdueCadences ? new Overdue(overdueSeconds, cadences) : null;
    }

    [Pure]
    private static IEnumerable<SystemReason> MailReasons(
        MailOutboxDetails mail,
        DateTimeOffset checkedAt
    )
    {
        if (mail.Retrying > 0)
            yield return Attention(SystemCheck.Mail, SystemReasonCode.MailRetrying, mail.Retrying);

        if (mail.OldestPendingAt is { } oldest && checkedAt - oldest > MailStuckAfter)
            yield return Broken(
                SystemCheck.Mail,
                SystemReasonCode.MailStuck,
                SecondsBetween(oldest, checkedAt)
            );
    }

    [Pure]
    private static double SecondsBetween(DateTimeOffset earlier, DateTimeOffset later) =>
        Math.Round((later - earlier).TotalSeconds);

    [Pure]
    private static SystemReason Attention(
        SystemCheck check,
        SystemReasonCode code,
        double? value = null,
        string? subject = null
    ) => ReasonOf(check, SystemLevel.Attention, code, value, subject);

    [Pure]
    private static SystemReason Broken(
        SystemCheck check,
        SystemReasonCode code,
        double? value = null,
        string? subject = null
    ) => ReasonOf(check, SystemLevel.Broken, code, value, subject);

    [Pure]
    private static SystemReason ReasonOf(
        SystemCheck check,
        SystemLevel level,
        SystemReasonCode code,
        double? value,
        string? subject
    ) =>
        new()
        {
            Check = check,
            Level = level,
            Code = code,
            Value = value,
            Subject = subject,
        };

    [Pure]
    public static SystemVerdictDetails Of(SystemFacts facts)
    {
        List<SystemReason> reasons =
        [
            .. DatabaseReasons(facts.Database),
            .. WorkerReasons(facts),
            .. QueueReasons(facts.Queue, facts.CheckedAt),
            .. StorageReasons(facts),
            .. MediaReasons(facts.Media),
            .. LogReasons(facts.ErrorsPerHour),
            .. facts.Services.SelectMany(run => ServiceReasons(run, facts.CheckedAt)),
            .. MailReasons(facts.Mail, facts.CheckedAt),
        ];

        return new SystemVerdictDetails
        {
            Level = reasons.Count == 0 ? SystemLevel.Ok : reasons.Max(reason => reason.Level),
            Reasons = [.. reasons.OrderByDescending(reason => reason.Level)],
        };
    }

    [Pure]
    public static string JobKeyOf(BackgroundJob job) =>
        JsonNamingPolicy.CamelCase.ConvertName(job.ToString());

    private sealed record Overdue(double Seconds, double Cadences);
}
