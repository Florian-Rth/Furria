using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppAddOnMessagesTests
{
    private const string Link = "https://app.example.test/announcements/7";

    private static readonly DateTimeOffset FridayEvening = new(
        2027,
        6,
        11,
        16,
        0,
        0,
        TimeSpan.Zero
    );

    [Theory]
    [InlineData(false, "Welcher Samstag?")]
    [InlineData(true, "Welcher Samstag? (bis Fr 11.6. · 18:00 Uhr)")]
    public void Should_NameTheDeadlineInTheQuestion_When_ThePollHasOne(
        bool hasDeadline,
        string expectedQuestion
    )
    {
        var message = WhatsAppAddOnMessages.PollOf(
            Poll(isAnonymous: false, hasDeadline ? FridayEvening : null),
            Link
        );

        Assert.Equal(expectedQuestion, message.Text);
    }

    [Theory]
    [InlineData(false, "Welcher Samstag?")]
    [InlineData(true, "Welcher Samstag? (bis Fr 11.6. · 18:00 Uhr)")]
    public void Should_NameTheDeadlineInTheQuestion_When_TheZuAbsageHasOne(
        bool hasDeadline,
        string expectedQuestion
    )
    {
        var message = WhatsAppAddOnMessages.AttendancePoll(
            "Welcher Samstag?",
            hasDeadline ? FridayEvening : null
        );

        Assert.Equal(expectedQuestion, message.Text);
    }

    [Theory]
    [InlineData(false, "🗳️ `FCC · ABSTIMMUNG`\nAnonym abstimmen: *Welcher Samstag?*\n↗ " + Link)]
    [InlineData(
        true,
        "🗳️ `FCC · ABSTIMMUNG`\nAnonym abstimmen: *Welcher Samstag?*\nBis Fr 11.6. · 18:00 Uhr\n↗ "
            + Link
    )]
    public void Should_NameTheDeadlineOnItsOwnLine_When_TheLinkedPollHasOne(
        bool hasDeadline,
        string expectedText
    )
    {
        var message = WhatsAppAddOnMessages.PollOf(
            Poll(isAnonymous: true, hasDeadline ? FridayEvening : null),
            Link
        );

        Assert.Equal(expectedText, message.Text);
    }

    [Fact]
    public void Should_NameTheDeadlineOnItsOwnLine_When_TheSignUpListHasOne()
    {
        var message = WhatsAppAddOnMessages.SignUpListOf(
            new SignUpList
            {
                Id = 3,
                Title = "Mitbringliste",
                SignUpUntil = FridayEvening,
            },
            Link
        );

        Assert.Equal(
            "📝 `FCC · EINTRAGSLISTE`\nEintragen: *Mitbringliste*\nBis Fr 11.6. · 18:00 Uhr\n↗ "
                + Link,
            message.Text
        );
    }

    private static Poll Poll(bool isAnonymous, DateTimeOffset? votesUntil) =>
        new()
        {
            Id = 5,
            Question = "Welcher Samstag?",
            IsAnonymous = isAnonymous,
            VotesUntil = votesUntil,
            Options =
            [
                new PollOption
                {
                    Id = 1,
                    Position = 0,
                    Label = "13. Juni",
                },
                new PollOption
                {
                    Id = 2,
                    Position = 1,
                    Label = "20. Juni",
                },
            ],
        };
}
