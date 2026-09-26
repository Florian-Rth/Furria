using System.Threading.Channels;

namespace Furria.Infrastructure.Identity;

public sealed class SignedOutMailRequestQueue
{
    private readonly Channel<SignedOutMailRequest> _channel =
        Channel.CreateUnbounded<SignedOutMailRequest>(
            new UnboundedChannelOptions { SingleReader = true }
        );

    private int _unanswered;

    public bool IsIdle => Volatile.Read(ref _unanswered) == 0;

    public void RequestAccess(string email) =>
        Enqueue(new SignedOutMailRequest(SignedOutMailRequestKind.AccessRequest, email));

    public void RequestPasswordReset(string email) =>
        Enqueue(new SignedOutMailRequest(SignedOutMailRequestKind.PasswordReset, email));

    public IAsyncEnumerable<SignedOutMailRequest> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);

    public void MarkAnswered() => Interlocked.Decrement(ref _unanswered);

    private void Enqueue(SignedOutMailRequest request)
    {
        Interlocked.Increment(ref _unanswered);
        if (_channel.Writer.TryWrite(request))
            return;

        MarkAnswered();
        throw new InvalidOperationException("The signed-out request queue no longer accepts.");
    }
}
