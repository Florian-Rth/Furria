using System.Diagnostics.Contracts;

namespace Furria.Application.Operations;

public static class BackgroundJobSchedule
{
    private static readonly IReadOnlyDictionary<BackgroundJob, TimeSpan> Cadences = new Dictionary<
        BackgroundJob,
        TimeSpan
    >
    {
        [BackgroundJob.AbandonedUploadSweep] = TimeSpan.FromHours(1),
        [BackgroundJob.MediaFileReaper] = TimeSpan.FromMinutes(1),
        [BackgroundJob.GalleryBinPurge] = TimeSpan.FromHours(1),
        [BackgroundJob.MailDispatcher] = TimeSpan.FromSeconds(5),
        [BackgroundJob.UnconfirmedApplicationPurge] = TimeSpan.FromMinutes(15),
        [BackgroundJob.LogEntryPurge] = TimeSpan.FromMinutes(15),
        [BackgroundJob.MediaStorageSurvey] = TimeSpan.FromHours(6),
    };

    private static readonly IReadOnlyDictionary<BackgroundJob, TimeSpan> FirstRunDelays =
        new Dictionary<BackgroundJob, TimeSpan>
        {
            [BackgroundJob.MediaStorageSurvey] = TimeSpan.FromMinutes(1),
        };

    [Pure]
    public static TimeSpan? CadenceOf(BackgroundJob job) =>
        Cadences.TryGetValue(job, out var cadence) ? cadence : null;

    [Pure]
    public static TimeSpan Every(BackgroundJob job) =>
        CadenceOf(job)
        ?? throw new ArgumentOutOfRangeException(nameof(job), job, "The job runs on demand.");

    [Pure]
    public static TimeSpan FirstRunDelayOf(BackgroundJob job) =>
        FirstRunDelays.TryGetValue(job, out var delay) ? delay : TimeSpan.Zero;
}
