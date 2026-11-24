using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Assistant;

public static class ClubAssistantConversation
{
    public const int MostRememberedTurns = 10;

    public static readonly TimeSpan MergeWindow = TimeSpan.FromSeconds(8);
    public static readonly TimeSpan ContinuationGap = TimeSpan.FromMinutes(30);
    public static readonly TimeSpan KeptFor = TimeSpan.FromDays(7);
    public static readonly TimeSpan NotTextRetold = TimeSpan.FromMinutes(30);

    [Pure]
    public static bool JoinsOpenQuestion(DateTimeOffset lastMessageAt, DateTimeOffset arrivedAt) =>
        arrivedAt - lastMessageAt <= MergeWindow;

    [Pure]
    public static string Joined(string question, string message) =>
        Capped(question + "\n" + message);

    [Pure]
    public static string Capped(string text) =>
        text.Length <= ClubAssistantQuestion.LongestText
            ? text
            : text[..CutBefore(text, ClubAssistantQuestion.LongestText)];

    [Pure]
    private static int CutBefore(string text, int length) =>
        char.IsHighSurrogate(text[length - 1]) ? length - 1 : length;

    [Pure]
    public static IReadOnlyList<ClubAssistantTurn> TurnsOf(
        IEnumerable<ClubAssistantQuestion> questions
    ) => [.. questions.SelectMany(TurnsOf).OrderBy(turn => turn.At).ThenBy(turn => turn.Speaker)];

    [Pure]
    public static IReadOnlyList<ClubAssistantTurn> HistoryBefore(
        IEnumerable<ClubAssistantTurn> earlier,
        DateTimeOffset askedAt
    )
    {
        var continued = new List<ClubAssistantTurn>();
        var following = askedAt;
        foreach (
            var turn in earlier.Where(turn => turn.At <= askedAt).OrderByDescending(turn => turn.At)
        )
        {
            if (continued.Count == MostRememberedTurns || following - turn.At > ContinuationGap)
                break;

            continued.Add(turn);
            following = turn.At;
        }

        continued.Reverse();
        return continued;
    }

    [Pure]
    public static bool IsNoticeDue(
        ClubAssistantNoticeKind kind,
        DateTimeOffset? lastToldAt,
        DateTimeOffset now
    ) =>
        lastToldAt is not { } told
        || (
            kind == ClubAssistantNoticeKind.NotText
                ? now - told > NotTextRetold
                : ClubClock.DayOf(told) != ClubClock.DayOf(now)
        );

    [Pure]
    private static IEnumerable<ClubAssistantTurn> TurnsOf(ClubAssistantQuestion question)
    {
        yield return new ClubAssistantTurn(
            ClubAssistantSpeaker.Asker,
            question.Text,
            question.LastMessageAt
        );
        if (question is { Answer: { } answer, AnsweredAt: { } answeredAt })
            yield return new ClubAssistantTurn(ClubAssistantSpeaker.Assistant, answer, answeredAt);
    }
}
