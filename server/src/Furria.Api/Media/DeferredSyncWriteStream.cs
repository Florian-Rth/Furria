namespace Furria.Api.Media;

public sealed class DeferredSyncWriteStream : Stream
{
    private readonly Stream _inner;
    private readonly MemoryStream _deferred = new();

    public override bool CanRead => false;

    public override bool CanSeek => false;

    public override bool CanWrite => true;

    public override long Length => throw new NotSupportedException();

    public override long Position
    {
        get => throw new NotSupportedException();
        set => throw new NotSupportedException();
    }

    public DeferredSyncWriteStream(Stream inner)
    {
        _inner = inner;
    }

    public override void Write(byte[] buffer, int offset, int count) =>
        _deferred.Write(buffer, offset, count);

    public override void Write(ReadOnlySpan<byte> buffer) => _deferred.Write(buffer);

    public override async ValueTask WriteAsync(
        ReadOnlyMemory<byte> buffer,
        CancellationToken cancellationToken = default
    )
    {
        await WriteDeferredAsync(cancellationToken);
        await _inner.WriteAsync(buffer, cancellationToken);
    }

    public override Task WriteAsync(
        byte[] buffer,
        int offset,
        int count,
        CancellationToken cancellationToken
    ) => WriteAsync(buffer.AsMemory(offset, count), cancellationToken).AsTask();

    public override async Task FlushAsync(CancellationToken cancellationToken)
    {
        await WriteDeferredAsync(cancellationToken);
        await _inner.FlushAsync(cancellationToken);
    }

    public override void Flush() { }

    public override int Read(byte[] buffer, int offset, int count) =>
        throw new NotSupportedException();

    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

    public override void SetLength(long value) => throw new NotSupportedException();

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _deferred.Dispose();

        base.Dispose(disposing);
    }

    private async Task WriteDeferredAsync(CancellationToken cancellationToken)
    {
        if (_deferred.Length == 0)
            return;

        await _inner.WriteAsync(
            _deferred.GetBuffer().AsMemory(0, (int)_deferred.Length),
            cancellationToken
        );
        _deferred.SetLength(0);
    }
}
