using System.Threading.Channels;

namespace Furria.Infrastructure.Mail;

public sealed class MailOutboxSignal
{
    private readonly Channel<bool> _rings = Channel.CreateBounded<bool>(
        new BoundedChannelOptions(1)
        {
            FullMode = BoundedChannelFullMode.DropWrite,
            SingleReader = true,
        }
    );

    public void Ring() => _rings.Writer.TryWrite(true);

    public async Task WaitAsync(TimeSpan patience, CancellationToken ct)
    {
        using var patienceRunsOut = CancellationTokenSource.CreateLinkedTokenSource(ct);
        patienceRunsOut.CancelAfter(patience);
        try
        {
            await _rings.Reader.ReadAsync(patienceRunsOut.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested) { }
    }
}
