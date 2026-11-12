using Furria.Core.Text;
using Xunit;

namespace Furria.Api.Tests.Text;

public sealed class RichTextTests
{
    private static readonly HashSet<MentionKind> EveryKind = [.. Enum.GetValues<MentionKind>()];
    private static readonly HashSet<MentionKind> NoKind = [];

    [Theory]
    [InlineData("group:4", MentionKind.Group)]
    [InlineData("person:4", MentionKind.Person)]
    [InlineData("calendar-entry:4", MentionKind.CalendarEntry)]
    [InlineData("event:4", MentionKind.Event)]
    [InlineData("news-post:4", MentionKind.NewsPost)]
    [InlineData("album:4", MentionKind.Album)]
    public void Should_ReadTheMention_When_TheHostMayMentionItsKind(string target, MentionKind kind)
    {
        var reading = RichText.Read($"Siehe @[Ziel]({target}).", EveryKind);

        Assert.Null(reading.Refusal);
        Assert.Equal([new Mention(kind, 4)], reading.Mentions);
    }

    [Fact]
    public void Should_RefuseTheMention_When_TheHostMentionsNothing()
    {
        Assert.NotNull(RichText.Read("Hallo @[Paula](person:12)", NoKind).Refusal);
    }

    [Fact]
    public void Should_KeepTheTextLiteral_When_TheHostMentionsNothingAndNoMentionIsWritten()
    {
        var reading = RichText.Read(
            "## Kopf\n\n- **Punkt** mit [Link](https://example.com)",
            NoKind
        );

        Assert.Null(reading.Refusal);
        Assert.Empty(reading.Mentions);
    }
}
