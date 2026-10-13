using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Furria.MediaWorker.Photos;
using Furria.MediaWorker.Renditions;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Furria.MediaWorker.Jobs;

public sealed class MediaJobRunner
{
    private static readonly TimeSpan LeaseRenewalInterval = MediaJobQueue.LeaseDuration / 3;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MediaRoot _root;
    private readonly PhotoRenderer _photoRenderer;
    private readonly VideoRenderer _videoRenderer;
    private readonly MediaWorkerActivity _activity;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MediaJobRunner> _logger;

    public MediaJobRunner(
        IServiceScopeFactory scopeFactory,
        MediaRoot root,
        PhotoRenderer photoRenderer,
        VideoRenderer videoRenderer,
        MediaWorkerActivity activity,
        TimeProvider timeProvider,
        ILogger<MediaJobRunner> logger
    )
    {
        _scopeFactory = scopeFactory;
        _root = root;
        _photoRenderer = photoRenderer;
        _videoRenderer = videoRenderer;
        _activity = activity;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> RunNextAsync(MediaKind kind, CancellationToken ct)
    {
        var lease = await WithQueueAsync(queue => queue.ClaimAsync(kind, ct));
        if (lease is null)
            return false;

        using var leaseHeld = CancellationTokenSource.CreateLinkedTokenSource(ct);
        var renewal = KeepLeaseAsync(lease, leaseHeld);
        try
        {
            await RenderAndRecordAsync(lease, leaseHeld.Token);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            await WithQueueAsync(queue => queue.ReleaseAsync(lease, CancellationToken.None));
            throw;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning(
                "Media job {MediaJobId} left to another worker, its lease was lost",
                lease.JobId
            );
        }
        catch (MissingOriginalException exception)
        {
            await WithQueueAsync(queue => queue.GiveUpAsync(lease, exception.Message, ct));
        }
        catch (Exception exception)
        {
            await WithQueueAsync(queue => queue.FailAsync(lease, ReasonOf(exception), ct));
        }
        finally
        {
            await leaseHeld.CancelAsync();
            await renewal;
            _activity.End(kind);
        }

        return true;
    }

    private async Task RenderAndRecordAsync(MediaJobLease lease, CancellationToken ct)
    {
        var job = await WithQueueAsync(queue => queue.DetailsOfAsync(lease, ct));
        if (job is null)
            return;

        _activity.Begin(job.Kind, job.MediaItemId);
        if (!_root.HasOriginalOf(job.StorageKey))
            throw new MissingOriginalException();

        using var files = new RenditionFiles(_root, job.StorageKey);
        var rendered =
            job.Kind == MediaKind.Video
                ? await _videoRenderer.RenderAsync(files, ct)
                : _photoRenderer.Render(files, job.Crop, job.PictureAspect);

        var itemExists = await WithQueueAsync(queue =>
            queue.CompleteAsync(CompletionOf(job, rendered), ct)
        );
        if (!itemExists)
            files.DeleteAll();
    }

    private async Task KeepLeaseAsync(MediaJobLease lease, CancellationTokenSource leaseHeld)
    {
        try
        {
            using var timer = new PeriodicTimer(LeaseRenewalInterval, _timeProvider);
            while (await timer.WaitForNextTickAsync(leaseHeld.Token))
                if (!await WithQueueAsync(queue => queue.RenewLeaseAsync(lease, leaseHeld.Token)))
                    await leaseHeld.CancelAsync();
        }
        catch (OperationCanceledException) { }
    }

    private async Task<T> WithQueueAsync<T>(Func<MediaJobQueue, Task<T>> operation)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        return await operation(scope.ServiceProvider.GetRequiredService<MediaJobQueue>());
    }

    private async Task WithQueueAsync(Func<MediaJobQueue, Task> operation)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await operation(scope.ServiceProvider.GetRequiredService<MediaJobQueue>());
    }

    private static CompleteMediaJobCommand CompletionOf(
        MediaJobDetails job,
        RenderedMedia rendered
    ) =>
        new()
        {
            Lease = job.Lease,
            MediaItemId = job.MediaItemId,
            Width = rendered.Width,
            Height = rendered.Height,
            DurationSeconds = rendered.DurationSeconds,
            CapturedAt = rendered.CapturedAt,
            Camera = rendered.Camera,
            AppliedCrop = rendered.AppliedCrop,
        };

    private static string ReasonOf(Exception exception) =>
        exception is MediaRenderingException or IOException
            ? exception.Message
            : $"{exception.GetType().Name}: {exception.Message}";
}
