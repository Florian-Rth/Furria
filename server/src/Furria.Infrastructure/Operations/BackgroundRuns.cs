using System.Diagnostics.Contracts;
using Furria.Application.Operations;

namespace Furria.Infrastructure.Operations;

public sealed class BackgroundRuns
{
    private readonly Lock _gate = new();
    private readonly Dictionary<BackgroundJob, RunRecord> _records = [];
    private readonly TimeProvider _timeProvider;
    private readonly HostStart _hostStart;

    public BackgroundRuns(TimeProvider timeProvider, HostStart hostStart)
    {
        _timeProvider = timeProvider;
        _hostStart = hostStart;
    }

    public async Task TrackAsync(BackgroundJob job, Func<Task> run)
    {
        Begin(job);
        try
        {
            await run();
            Succeed(job);
        }
        catch (OperationCanceledException)
        {
            Abandon(job);
            throw;
        }
        catch (Exception exception)
        {
            Fail(job, exception);
            throw;
        }
    }

    public void Track(BackgroundJob job, Action run)
    {
        Begin(job);
        try
        {
            run();
            Succeed(job);
        }
        catch (Exception exception)
        {
            Fail(job, exception);
            throw;
        }
    }

    public IReadOnlyList<BackgroundRunSummary> Snapshot()
    {
        lock (_gate)
            return [.. Enum.GetValues<BackgroundJob>().Select(SummaryOf)];
    }

    private void Begin(BackgroundJob job) =>
        Update(
            job,
            record =>
                record with
                {
                    LastRunAt = _timeProvider.GetUtcNow(),
                    Running = record.Running + 1,
                }
        );

    private void Succeed(BackgroundJob job) =>
        Update(
            job,
            record =>
                record with
                {
                    Running = record.Running - 1,
                    LastFailure = null,
                    ConsecutiveFailures = 0,
                }
        );

    private void Fail(BackgroundJob job, Exception exception) =>
        Update(
            job,
            record =>
                record with
                {
                    Running = record.Running - 1,
                    LastFailure = exception.GetType().Name,
                    ConsecutiveFailures = record.ConsecutiveFailures + 1,
                }
        );

    private void Abandon(BackgroundJob job) =>
        Update(job, record => record with { Running = record.Running - 1 });

    private void Update(BackgroundJob job, Func<RunRecord, RunRecord> change)
    {
        lock (_gate)
            _records[job] = change(_records.GetValueOrDefault(job, RunRecord.NeverRun));
    }

    private BackgroundRunSummary SummaryOf(BackgroundJob job)
    {
        var record = _records.GetValueOrDefault(job, RunRecord.NeverRun);
        var cadence = BackgroundJobSchedule.CadenceOf(job);
        return new BackgroundRunSummary
        {
            Job = job,
            CadenceSeconds = cadence is { } every ? (int)every.TotalSeconds : null,
            LastRunAt = record.LastRunAt,
            LastFailure = record.LastFailure,
            ConsecutiveFailures = record.ConsecutiveFailures,
            NextDueAt = NextDueAt(job, cadence, record.LastRunAt, _hostStart.StartedAt),
            IsRunning = record.Running > 0,
        };
    }

    [Pure]
    private static DateTimeOffset? NextDueAt(
        BackgroundJob job,
        TimeSpan? cadence,
        DateTimeOffset? lastRunAt,
        DateTimeOffset hostStartedAt
    ) =>
        cadence is not { } every ? null
        : lastRunAt is { } last ? last + every
        : hostStartedAt + BackgroundJobSchedule.FirstRunDelayOf(job);

    private sealed record RunRecord(
        DateTimeOffset? LastRunAt,
        string? LastFailure,
        int ConsecutiveFailures,
        int Running
    )
    {
        public static readonly RunRecord NeverRun = new(null, null, 0, 0);
    }
}
