using System.Threading.Channels;

namespace Furria.Infrastructure.Identity;

public sealed class SignedOutMailRequestQueue
{
    private readonly Channel<SignedOutMailRequest> _channel =
        Channel.CreateUnbounded<SignedOutMailRequest>(
            new UnboundedChannelOptions { SingleReader = true }
        );

    public void RequestAccess(string email) =>
        Enqueue(new SignedOutMailRequest(SignedOutMailRequestKind.AccessRequest, email));

    public void RequestPasswordReset(string email) =>
        Enqueue(new SignedOutMailRequest(SignedOutMailRequestKind.PasswordReset, email));

    public IAsyncEnumerable<SignedOutMailRequest> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);

    private void Enqueue(SignedOutMailRequest request)
    {
        if (!_channel.Writer.TryWrite(request))
            throw new InvalidOperationException("The signed-out request queue no longer accepts.");
    }
}
