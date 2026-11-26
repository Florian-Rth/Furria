using Furria.Application.ClubApp;
using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantNotices
{
    private readonly AppDbContext _dbContext;
    private readonly ClubAssistantReplies _replies;
    private readonly IOptions<ClubAppOptions> _clubApp;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantNotices(
        AppDbContext dbContext,
        ClubAssistantReplies replies,
        IOptions<ClubAppOptions> clubApp,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _replies = replies;
        _clubApp = clubApp;
        _timeProvider = timeProvider;
    }

    public async Task TellAsync(string chatId, ClubAssistantNoticeKind kind, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var notice = await _dbContext.ClubAssistantNotices.SingleOrDefaultAsync(
            row => row.ChatId == chatId && row.Kind == kind,
            ct
        );
        if (!ClubAssistantConversation.IsNoticeDue(kind, notice?.ToldAt, now))
            return;

        if (notice is null)
            _dbContext.ClubAssistantNotices.Add(
                new ClubAssistantNotice
                {
                    ChatId = chatId,
                    Kind = kind,
                    ToldAt = now,
                }
            );
        else
            notice.ToldAt = now;

        _replies.Queue(
            chatId,
            ClubAssistantLines.Of(kind, _clubApp.Value.BaseUrl, ClubClock.DayOf(now))
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    public Task PurgeAsync(CancellationToken ct)
    {
        var cutoff = _timeProvider.GetUtcNow() - ClubAssistantConversation.KeptFor;
        return _dbContext
            .ClubAssistantNotices.Where(notice => notice.ToldAt < cutoff)
            .ExecuteDeleteAsync(ct);
    }
}
