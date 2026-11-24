using System.Diagnostics.Contracts;
using Furria.Application.Assistant;
using Furria.Application.ClubApp;
using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantAnswers
{
    private readonly AppDbContext _dbContext;
    private readonly ClubAssistantAskers _askers;
    private readonly ClubAssistantTools _tools;
    private readonly ClubAssistantDialogue _dialogue;
    private readonly ClubAssistantReplies _replies;
    private readonly WahaClient _waha;
    private readonly IChatClient? _chat;
    private readonly IOptions<ClubAssistantOptions> _options;
    private readonly IOptions<ClubAppOptions> _clubApp;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<ClubAssistantAnswers> _logger;

    private string AppUrl => _clubApp.Value.BaseUrl;

    private DateOnly Today => ClubClock.Today(_timeProvider);

    public ClubAssistantAnswers(
        AppDbContext dbContext,
        ClubAssistantAskers askers,
        ClubAssistantTools tools,
        ClubAssistantDialogue dialogue,
        ClubAssistantReplies replies,
        WahaClient waha,
        IOptions<ClubAssistantOptions> options,
        IOptions<ClubAppOptions> clubApp,
        TimeProvider timeProvider,
        ILogger<ClubAssistantAnswers> logger,
        IChatClient? chat = null
    )
    {
        _dbContext = dbContext;
        _askers = askers;
        _tools = tools;
        _dialogue = dialogue;
        _replies = replies;
        _waha = waha;
        _chat = chat;
        _options = options;
        _clubApp = clubApp;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> AnswerNextAsync(CancellationToken ct)
    {
        if (await NextDueAsync(ct) is not { } question)
            return false;

        await WriteAsync(question, await SafeReplyToAsync(question, ct), ct);
        return true;
    }

    private async Task<string> SafeReplyToAsync(
        ClubAssistantQuestion question,
        CancellationToken ct
    )
    {
        try
        {
            return await ReplyToAsync(question, ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            _logger.LogWarning(
                exception,
                "Club assistant could not answer question {Id}",
                question.Id
            );
            _dbContext.ChangeTracker.Clear();
            return ClubAssistantLines.ProviderFailed(AppUrl);
        }
    }

    private Task<ClubAssistantQuestion?> NextDueAsync(CancellationToken ct)
    {
        var settledBefore = _timeProvider.GetUtcNow() - ClubAssistantConversation.MergeWindow;
        return _dbContext
            .ClubAssistantQuestions.AsNoTracking()
            .Where(question => question.AnsweredAt == null)
            .Where(question => question.LastMessageAt <= settledBefore)
            .OrderBy(question => question.LastMessageAt)
            .ThenBy(question => question.Id)
            .FirstOrDefaultAsync(ct);
    }

    private async Task<string> ReplyToAsync(ClubAssistantQuestion question, CancellationToken ct)
    {
        var settings = await _dbContext.ClubAssistantSettingsAsync(ct);
        if (!settings.IsEnabled || !_options.Value.IsConfigured || _chat is null)
            return ClubAssistantLines.Of(ClubAssistantNoticeKind.SwitchedOff, AppUrl, Today);

        if (await _askers.OfAsync(question.PersonId, ct) is not { } asker)
            return ClubAssistantLines.UnknownSender;

        await ShowTypingAsync(question.ChatId, ct);
        var outcome = await _dialogue.ConverseAsync(
            _chat,
            ClubAssistantPrompt.MessagesFor(
                asker,
                ClubAssistantFacts.MomentOf(_timeProvider.GetUtcNow()),
                AppUrl,
                await HistoryBeforeAsync(question, ct),
                question.Text
            ),
            _tools.For(asker),
            ct
        );
        return LineOf(outcome, AppUrl, Today);
    }

    [Pure]
    private static string LineOf(ClubAssistantOutcome outcome, string appUrl, DateOnly today) =>
        outcome.Kind switch
        {
            ClubAssistantOutcomeKind.Answered => outcome.Text,
            ClubAssistantOutcomeKind.BudgetUsedUp => ClubAssistantLines.Of(
                ClubAssistantNoticeKind.BudgetUsedUp,
                appUrl,
                today
            ),
            _ => ClubAssistantLines.ProviderFailed(appUrl),
        };

    private async Task<IReadOnlyList<ClubAssistantTurn>> HistoryBeforeAsync(
        ClubAssistantQuestion question,
        CancellationToken ct
    )
    {
        var earlier = await _dbContext
            .ClubAssistantQuestions.AsNoTracking()
            .Where(earlier => earlier.PersonId == question.PersonId)
            .Where(earlier => earlier.Id != question.Id && earlier.AnsweredAt != null)
            .Where(earlier =>
                earlier.LastMessageAt >= question.AskedAt - ClubAssistantConversation.KeptFor
            )
            .ToListAsync(ct);

        return ClubAssistantConversation.HistoryBefore(
            ClubAssistantConversation.TurnsOf(earlier),
            question.AskedAt
        );
    }

    private async Task ShowTypingAsync(string chatId, CancellationToken ct)
    {
        try
        {
            await _waha.StartTypingAsync(chatId, ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            _logger.LogInformation(exception, "WhatsApp typing indicator could not be shown");
        }
    }

    private async Task WriteAsync(
        ClubAssistantQuestion question,
        string reply,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var isIntroduced = await _dbContext.ClubAssistantAcquaintances.AnyAsync(
            acquaintance => acquaintance.PersonId == question.PersonId,
            ct
        );
        var answer = ClubAssistantLines.AnswerFor(reply, isIntroduced);
        var now = _timeProvider.GetUtcNow();

        if (await MarkAnsweredAsync(question, answer, now, ct) == 0)
            return;

        if (!isIntroduced)
            _dbContext.ClubAssistantAcquaintances.Add(
                new ClubAssistantAcquaintance { PersonId = question.PersonId, IntroducedAt = now }
            );
        _replies.Queue(question.ChatId, answer);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    private Task<int> MarkAnsweredAsync(
        ClubAssistantQuestion question,
        string answer,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        _dbContext
            .ClubAssistantQuestions.Where(unanswered =>
                unanswered.Id == question.Id
                && unanswered.AnsweredAt == null
                && unanswered.LastMessageAt == question.LastMessageAt
                && unanswered.Text == question.Text
            )
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(answered => answered.Answer, answer)
                        .SetProperty(answered => answered.AnsweredAt, now),
                ct
            );
}
