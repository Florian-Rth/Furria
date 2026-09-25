using System.Threading.Channels;

namespace Furria.Infrastructure.Mail;

public sealed class MailQueue
{
    private readonly Channel<OutgoingMail> _channel = Channel.CreateUnbounded<OutgoingMail>(
        new UnboundedChannelOptions { SingleReader = true }
    );

    public void Enqueue(OutgoingMail mail)
    {
        if (!_channel.Writer.TryWrite(mail))
            throw new InvalidOperationException("The mail queue no longer accepts mail.");
    }

    public IAsyncEnumerable<OutgoingMail> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}
