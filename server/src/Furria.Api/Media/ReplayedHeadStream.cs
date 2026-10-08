namespace Furria.Api.Media;

public sealed class ReplayedHeadStream : Stream
{
    private readonly ReadOnlyMemory<byte> _head;
    private readonly Stream _rest;
    private int _replayed;

    public override bool CanRead => true;

    public override bool CanSeek => false;

    public override bool CanWrite => false;

    public override long Length => throw new NotSupportedException();

    public override long Position
    {
        get => throw new NotSupportedException();
        set => throw new NotSupportedException();
    }

    public ReplayedHeadStream(ReadOnlyMemory<byte> head, Stream rest)
    {
        _head = head;
        _rest = rest;
    }

    public override int Read(byte[] buffer, int offset, int count) =>
        Read(buffer.AsSpan(offset, count));

    public override int Read(Span<byte> buffer) =>
        _replayed < _head.Length ? Replay(buffer) : _rest.Read(buffer);

    public override Task<int> ReadAsync(
        byte[] buffer,
        int offset,
        int count,
        CancellationToken cancellationToken
    ) => ReadAsync(buffer.AsMemory(offset, count), cancellationToken).AsTask();

    public override ValueTask<int> ReadAsync(
        Memory<byte> buffer,
        CancellationToken cancellationToken = default
    ) =>
        _replayed < _head.Length
            ? ValueTask.FromResult(Replay(buffer.Span))
            : _rest.ReadAsync(buffer, cancellationToken);

    public override void Flush() { }

    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

    public override void SetLength(long value) => throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count) =>
        throw new NotSupportedException();

    private int Replay(Span<byte> buffer)
    {
        var count = Math.Min(buffer.Length, _head.Length - _replayed);
        _head.Span.Slice(_replayed, count).CopyTo(buffer);
        _replayed += count;
        return count;
    }
}
