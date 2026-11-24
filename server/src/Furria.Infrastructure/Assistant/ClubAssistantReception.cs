using Furria.Application.Assistant;
using Furria.Application.WhatsApp;
using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantReception
{
    private readonly AppDbContext _dbContext;
    private readonly WhatsAppSenderMatch _senders;
    private readonly ClubAssistantNotices _notices;
    private readonly ClubAssistantConversations _conversations;
    private readonly ClubAssistantBudget _budget;
    private readonly IOptions<WhatsAppOptions> _whatsApp;
    private readonly IOptions<ClubAssistantOptions> _options;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantReception(
        AppDbContext dbContext,
        WhatsAppSenderMatch senders,
        ClubAssistantNotices notices,
        ClubAssistantConversations conversations,
        ClubAssistantBudget budget,
        IOptions<WhatsAppOptions> whatsApp,
        IOptions<ClubAssistantOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _senders = senders;
        _notices = notices;
        _conversations = conversations;
        _budget = budget;
        _whatsApp = whatsApp;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task ReceiveAsync(InboxWhatsAppEvent inboxEvent, CancellationToken ct)
    {
        if (
            inboxEvent.Session != _whatsApp.Value.Session
            || WahaPrivateMessages.Read(inboxEvent.Body, inboxEvent.ReceivedAt) is not { } message
        )
            return;

        var settings = await SettingsAsync(ct);
        if (!settings.IsEnabled || !_options.Value.IsConfigured)
            await _notices.TellAsync(message.ChatId, ClubAssistantNoticeKind.SwitchedOff, ct);
        else if (await AffiliatedAskerAsync(message.ChatId, ct) is not { } personId)
            await _notices.TellAsync(message.ChatId, ClubAssistantNoticeKind.UnknownSender, ct);
        else if (!message.IsText)
            await _notices.TellAsync(message.ChatId, ClubAssistantNoticeKind.NotText, ct);
        else
            await AskOrJoinAsync(personId, message, settings, ct);
    }

    public async Task PurgeAsync(CancellationToken ct)
    {
        await _conversations.PurgeAsync(ct);
        await _notices.PurgeAsync(ct);
    }

    private async Task AskOrJoinAsync(
        int personId,
        WhatsAppPrivateMessage message,
        ClubAssistantSettings settings,
        CancellationToken ct
    )
    {
        if (await _conversations.JoinOpenQuestionAsync(personId, message, ct))
            return;

        if (
            await _conversations.QuestionsTodayAsync(personId, ct)
            >= settings.QuestionsPerPersonPerDay
        )
            await _notices.TellAsync(message.ChatId, ClubAssistantNoticeKind.DailyLimitReached, ct);
        else if (!await _budget.HasBudgetLeftAsync(ct))
            await _notices.TellAsync(message.ChatId, ClubAssistantNoticeKind.BudgetUsedUp, ct);
        else
            await _conversations.AskAsync(personId, message, ct);
    }

    private async Task<ClubAssistantSettings> SettingsAsync(CancellationToken ct) =>
        await _dbContext
            .ClubAssistantSettingsRows.AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == ClubAssistantSettings.TheOnlyId, ct)
        ?? new ClubAssistantSettings();

    private async Task<int?> AffiliatedAskerAsync(string chatId, CancellationToken ct)
    {
        if ((await _senders.MatchAsync(chatId, ct)).PersonId is not { } personId)
            return null;

        var isAffiliated = await _dbContext
            .People.Where(person => person.Id == personId)
            .AnyAsync(AffiliationQuery.IsAffiliatedOn(ClubClock.Today(_timeProvider)), ct);
        return isAffiliated ? personId : null;
    }
}
