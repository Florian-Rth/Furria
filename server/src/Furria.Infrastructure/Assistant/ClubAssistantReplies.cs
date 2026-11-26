using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantReplies
{
    private const int NoHostId = 0;

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantReplies(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public void Queue(string chatId, string text) =>
        _dbContext.OutboxWhatsApps.Add(
            new OutboxWhatsApp
            {
                ChatId = chatId,
                Operation = WhatsAppOperation.PrivateReply,
                HostKind = WhatsAppHostKind.ClubAssistant,
                HostId = NoHostId,
                Text = text,
                EnqueuedAt = _timeProvider.GetUtcNow(),
            }
        );
}
