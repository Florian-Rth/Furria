using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantConversations
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantConversations(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<bool> JoinOpenQuestionAsync(
        int personId,
        WhatsAppPrivateMessage message,
        CancellationToken ct
    )
    {
        var open = await _dbContext
            .ClubAssistantQuestions.FromSql(
                $"""
                SELECT * FROM club_assistant_question
                WHERE person_id = {personId} AND answered_at IS NULL
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
                """
            )
            .SingleOrDefaultAsync(ct);
        if (
            open is null
            || !ClubAssistantConversation.JoinsOpenQuestion(open.LastMessageAt, message.SentAt)
        )
            return false;

        open.Text = ClubAssistantConversation.Joined(open.Text, message.Text ?? "");
        open.ChatId = message.ChatId;
        if (message.SentAt > open.LastMessageAt)
            open.LastMessageAt = message.SentAt;
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public Task<int> QuestionsTodayAsync(int personId, CancellationToken ct)
    {
        var startOfToday = ClubClock.StartOfDay(ClubClock.Today(_timeProvider));
        return _dbContext.ClubAssistantQuestions.CountAsync(
            question => question.PersonId == personId && question.AskedAt >= startOfToday,
            ct
        );
    }

    public async Task AskAsync(int personId, WhatsAppPrivateMessage message, CancellationToken ct)
    {
        _dbContext.ClubAssistantQuestions.Add(
            new ClubAssistantQuestion
            {
                PersonId = personId,
                ChatId = message.ChatId,
                Text = ClubAssistantConversation.Capped(message.Text ?? ""),
                AskedAt = message.SentAt,
                LastMessageAt = message.SentAt,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    public Task PurgeAsync(CancellationToken ct)
    {
        var cutoff = _timeProvider.GetUtcNow() - ClubAssistantConversation.KeptFor;
        return _dbContext
            .ClubAssistantQuestions.Where(question => question.AskedAt < cutoff)
            .ExecuteDeleteAsync(ct);
    }
}
