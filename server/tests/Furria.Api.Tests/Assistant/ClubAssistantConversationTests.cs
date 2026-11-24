using Furria.Core.Assistant;
using Xunit;

namespace Furria.Api.Tests.Assistant;

public sealed class ClubAssistantConversationTests
{
    private static readonly DateTimeOffset Noon = new(2026, 11, 24, 11, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Should_JoinTheOpenQuestion_When_TheNextMessageFollowsWithinSeconds()
    {
        Assert.True(ClubAssistantConversation.JoinsOpenQuestion(Noon, Noon.AddSeconds(5)));
        Assert.False(ClubAssistantConversation.JoinsOpenQuestion(Noon, Noon.AddSeconds(30)));
    }

    [Fact]
    public void Should_CarryTheEarlierTurns_When_EachFollowsWithinHalfAnHour()
    {
        var earlier = ClubAssistantConversation.TurnsOf([
            Answered("Wann ist Training?", Noon.AddMinutes(-80), "Dienstag", Noon.AddMinutes(-79)),
            Answered("Wo?", Noon.AddMinutes(-40), "Vereinsheim", Noon.AddMinutes(-39)),
            Answered("Wie lange?", Noon.AddMinutes(-20), "Zwei Stunden", Noon.AddMinutes(-19)),
        ]);

        var history = ClubAssistantConversation.HistoryBefore(earlier, Noon);

        Assert.Equal(
            ["Wo?", "Vereinsheim", "Wie lange?", "Zwei Stunden"],
            history.Select(turn => turn.Text)
        );
    }

    [Fact]
    public void Should_StartFresh_When_TheLastTurnIsOlderThanHalfAnHour()
    {
        var earlier = ClubAssistantConversation.TurnsOf([
            Answered("Wann ist Training?", Noon.AddMinutes(-45), "Dienstag", Noon.AddMinutes(-44)),
        ]);

        Assert.Empty(ClubAssistantConversation.HistoryBefore(earlier, Noon));
    }

    [Fact]
    public void Should_KeepOnlyTheLatestTurns_When_TheConversationRunsLong()
    {
        var earlier = ClubAssistantConversation.TurnsOf(
            Enumerable
                .Range(1, 8)
                .Select(step =>
                    Answered(
                        $"Frage {step}",
                        Noon.AddMinutes(-20 + 2 * step),
                        $"Antwort {step}",
                        Noon.AddMinutes(-19 + 2 * step)
                    )
                )
        );

        var history = ClubAssistantConversation.HistoryBefore(earlier, Noon);

        Assert.Equal(ClubAssistantConversation.MostRememberedTurns, history.Count);
        Assert.Equal(("Frage 4", "Antwort 8"), (history[0].Text, history[^1].Text));
    }

    [Fact]
    public void Should_TellANoticeAgain_When_ANewClubDayBegan()
    {
        var lateEvening = new DateTimeOffset(2026, 11, 24, 22, 30, 0, TimeSpan.Zero);

        Assert.False(
            ClubAssistantConversation.IsNoticeDue(
                ClubAssistantNoticeKind.UnknownSender,
                lateEvening.AddHours(-10),
                lateEvening
            )
        );
        Assert.True(
            ClubAssistantConversation.IsNoticeDue(
                ClubAssistantNoticeKind.UnknownSender,
                lateEvening.AddHours(-1),
                lateEvening.AddHours(1)
            )
        );
    }

    [Fact]
    public void Should_AskToTypeAgain_When_HalfAnHourPassed()
    {
        Assert.False(
            ClubAssistantConversation.IsNoticeDue(
                ClubAssistantNoticeKind.NotText,
                Noon.AddMinutes(-10),
                Noon
            )
        );
        Assert.True(
            ClubAssistantConversation.IsNoticeDue(
                ClubAssistantNoticeKind.NotText,
                Noon.AddMinutes(-31),
                Noon
            )
        );
    }

    [Fact]
    public void Should_KeepEmojisWhole_When_ALongQuestionIsCut()
    {
        var text = new string('a', ClubAssistantQuestion.LongestText - 1) + "🎭🎭";

        var capped = ClubAssistantConversation.Capped(text);

        Assert.Equal(ClubAssistantQuestion.LongestText - 1, capped.Length);
    }

    private static ClubAssistantQuestion Answered(
        string text,
        DateTimeOffset askedAt,
        string answer,
        DateTimeOffset answeredAt
    ) =>
        new()
        {
            Text = text,
            AskedAt = askedAt,
            LastMessageAt = askedAt,
            Answer = answer,
            AnsweredAt = answeredAt,
        };
}
