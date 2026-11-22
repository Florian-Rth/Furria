using System.Text;
using Furria.Application.Results;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppInbox
{
    private const string UnsignedMessage = "Die Signatur passt nicht.";
    private const string UnreadableMessage = "Das Ereignis ist nicht lesbar.";

    private readonly AppDbContext _dbContext;
    private readonly WhatsAppInboxSignal _signal;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;

    public WhatsAppInbox(
        AppDbContext dbContext,
        WhatsAppInboxSignal signal,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _signal = signal;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task<Result> ReceiveAsync(
        ReceiveWhatsAppWebhookCommand command,
        CancellationToken ct
    )
    {
        var options = _options.Value;
        if (!options.IsConfigured)
            return Result.NotFound(WhatsAppMessages.SwitchedOff);
        if (!WebhookSignature.Verifies(options.WebhookHmacKey, command.Body, command.Signature))
            return Result.Unauthorized(UnsignedMessage);
        if (
            command.RequestId.Length is 0 or > InboxWhatsAppEvent.RequestIdLength
            || WahaWebhookEnvelope.Read(command.Body) is not { } envelope
        )
            return Result.Validation(UnreadableMessage);

        await StoreOnceAsync(command, envelope, ct);
        _signal.Ring();
        return Result.Success();
    }

    private Task StoreOnceAsync(
        ReceiveWhatsAppWebhookCommand command,
        WahaWebhookEnvelope envelope,
        CancellationToken ct
    ) =>
        _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO inbox_whatsapp
                (request_id, event, session, occurred_at, received_at, body, attempt)
            VALUES
                ({command.RequestId}, {envelope.Event}, {envelope.Session},
                 {envelope.OccurredAt}, {_timeProvider.GetUtcNow()},
                 {Encoding.UTF8.GetString(command.Body)}::jsonb, 1)
            ON CONFLICT (request_id) DO NOTHING
            """,
            ct
        );
}
