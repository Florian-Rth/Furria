using System.Text.Json;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WahaAnswerEventsTests
{
    private static readonly DateTimeOffset Received = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);

    public static readonly TheoryData<string, AttendanceAnswer?> EventResponses = new()
    {
        { "GOING", AttendanceAnswer.Yes },
        { "NOT_GOING", AttendanceAnswer.No },
        { "MAYBE", AttendanceAnswer.Maybe },
        { "UNKNOWN", null },
    };

    [Fact]
    public void Should_ReadTheVoterAndHerSelection_When_AGroupMemberVotes()
    {
        var body = JsonSerializer.Serialize(
            new
            {
                @event = "poll.vote",
                payload = new
                {
                    vote = new
                    {
                        id = "false_120363@g.us_VOTE1_123@lid",
                        from = "120363@g.us",
                        fromMe = false,
                        participant = "123@lid",
                        selectedOptions = new[] { "Ja", "Vielleicht" },
                        timestamp = 1_800_000_000,
                    },
                    poll = new { id = "true_120363@g.us_POLLKEY", fromMe = true },
                },
            }
        );

        var answer = WahaAnswerEvents.Read(WahaEvents.PollVote, body, Received);

        Assert.NotNull(answer);
        Assert.Equal(
            ("POLLKEY", "123@lid", DateTimeOffset.FromUnixTimeSeconds(1_800_000_000)),
            (answer.MessageKey, answer.SenderId, answer.AnsweredAt)
        );
        Assert.Equal(["Ja", "Vielleicht"], answer.SelectedOptions);
    }

    [Fact]
    public void Should_FallBackToTheDeliveryTime_When_TheVoteCarriesNoTimestamp()
    {
        var body = JsonSerializer.Serialize(
            new
            {
                payload = new
                {
                    vote = new
                    {
                        from = "491701234567@c.us",
                        selectedOptions = Array.Empty<string>(),
                    },
                    poll = new { id = "POLLKEY" },
                },
            }
        );

        var answer = WahaAnswerEvents.Read(WahaEvents.PollVote, body, Received);

        Assert.NotNull(answer);
        Assert.Equal(("491701234567@c.us", Received), (answer.SenderId, answer.AnsweredAt));
        Assert.Empty(answer.SelectedOptions);
    }

    [Fact]
    public void Should_IgnoreTheVote_When_TheBotCastsIt()
    {
        var body = JsonSerializer.Serialize(
            new
            {
                payload = new
                {
                    vote = new
                    {
                        from = "491701234567@c.us",
                        fromMe = true,
                        selectedOptions = new[] { "Ja" },
                    },
                    poll = new { id = "POLLKEY" },
                },
            }
        );

        Assert.Null(WahaAnswerEvents.Read(WahaEvents.PollVote, body, Received));
    }

    [Theory]
    [MemberData(nameof(EventResponses))]
    public void Should_ReadTheAttendance_When_AMemberRespondsToTheEvent(
        string response,
        AttendanceAnswer? attendance
    )
    {
        var body = JsonSerializer.Serialize(
            new
            {
                @event = "event.response",
                payload = new
                {
                    from = "120363@g.us",
                    fromMe = false,
                    participant = "491701234567@c.us",
                    timestamp = 1_800_000_000,
                    eventCreationKey = new { id = "true_120363@g.us_EVENTKEY" },
                    eventResponse = new { response, timestampMs = 1_800_000_123_000 },
                },
            }
        );

        var answer = WahaAnswerEvents.Read(WahaEvents.EventResponse, body, Received);

        Assert.NotNull(answer);
        Assert.Equal(
            (
                "EVENTKEY",
                "491701234567@c.us",
                DateTimeOffset.FromUnixTimeMilliseconds(1_800_000_123_000),
                attendance
            ),
            (answer.MessageKey, answer.SenderId, answer.AnsweredAt, answer.Attendance)
        );
    }

    [Fact]
    public void Should_ReadNothing_When_TheGroupVoteNamesNoVoter()
    {
        var body = JsonSerializer.Serialize(
            new
            {
                payload = new
                {
                    vote = new { from = "120363@g.us", selectedOptions = new[] { "Ja" } },
                    poll = new { id = "POLLKEY" },
                },
            }
        );

        Assert.Null(WahaAnswerEvents.Read(WahaEvents.PollVote, body, Received));
    }

    [Theory]
    [InlineData("true_120363@g.us_3EB0ABC", "3EB0ABC")]
    [InlineData("true_120363@g.us_3EB0ABC_491701234567@c.us", "3EB0ABC")]
    [InlineData("3EB0ABC", "3EB0ABC")]
    public void Should_ReadTheMessageKey_When_TheIdIsSerialisedOrBare(string id, string key)
    {
        Assert.Equal(key, WahaAnswerEvents.MessageKeyOf(id));
    }
}
