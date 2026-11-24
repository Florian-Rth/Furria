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
}
