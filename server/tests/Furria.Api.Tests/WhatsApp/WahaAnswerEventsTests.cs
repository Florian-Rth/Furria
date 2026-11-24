using System.Text.Json;
using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WahaAnswerEventsTests
{
    private static readonly DateTimeOffset Received = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);

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
}
