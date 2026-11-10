using System.Threading.Channels;

namespace Furria.Application.Changes;

public sealed class ChangeSubscription : IDisposable
{
    private const int UnreadBatchesKept = 32;

    private readonly Channel<ChangeBatch> _unread;
    private readonly Action<ChangeSubscription> _unsubscribe;
    private int _hasDroppedBatches;

    internal ChangeSubscription(Action<ChangeSubscription> unsubscribe)
    {
        _unsubscribe = unsubscribe;
        _unread = Channel.CreateBounded<ChangeBatch>(
            new BoundedChannelOptions(UnreadBatchesKept)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true,
            },
            _ => Volatile.Write(ref _hasDroppedBatches, 1)
        );
    }

    internal void Deliver(ChangeBatch batch) => _unread.Writer.TryWrite(batch);

    public async ValueTask<ChangeBatch> ReadAsync(CancellationToken ct)
    {
        var batch = await _unread.Reader.ReadAsync(ct);
        return Interlocked.Exchange(ref _hasDroppedBatches, 0) == 1
            ? ChangeBatch.Everything
            : batch;
    }

    public void Dispose()
    {
        _unsubscribe(this);
        _unread.Writer.TryComplete();
    }
}
