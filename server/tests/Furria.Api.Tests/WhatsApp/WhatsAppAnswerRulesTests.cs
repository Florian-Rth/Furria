using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppAnswerRulesTests
{
    private static readonly DateTimeOffset Noon = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Should_MapTheTextsToTheOptionIdsByPosition_When_AMemberVotes()
    {
        var optionIds = WhatsAppAnswerRules.PollOptionIdsOf(
            ["Rot", "Blau", "Grün"],
            [11, 12, 13],
            ["Grün", "Rot", "Lila"]
        );

        Assert.Equal([11, 13], optionIds);
    }

    [Theory]
    [InlineData(null, null, null, false)]
    [InlineData(-1, null, null, true)]
    [InlineData(1, null, null, false)]
    [InlineData(null, 0, null, true)]
    [InlineData(null, 1, null, false)]
    [InlineData(null, 5, -5, true)]
    [InlineData(null, null, 1, false)]
    public void Should_CloseTheAddOn_When_TheAnswerComesAfterItsClose(
        int? closedMinutes,
        int? deadlineMinutes,
        int? hostClosesMinutes,
        bool isClosed
    )
    {
        Assert.Equal(
            isClosed,
            WhatsAppAnswerRules.IsClosedAt(
                At(closedMinutes),
                At(deadlineMinutes),
                At(hostClosesMinutes),
                Noon
            )
        );
    }

    private static DateTimeOffset? At(int? minutes) =>
        minutes is { } offset ? Noon.AddMinutes(offset) : null;
}
