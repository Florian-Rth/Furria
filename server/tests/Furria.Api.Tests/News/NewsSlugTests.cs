using Furria.Core.News;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class NewsSlugTests
{
    [Fact]
    public void Should_WriteTheTitleAsAnAddress_When_ItCarriesUmlautsAndPunctuation()
    {
        Assert.Equal(
            "maennerballett-tanzt-an-der-scala",
            NewsSlug.Of("Männerballett tanzt an der Scala!")
        );
        Assert.Equal("grosse-strassenparty-2027", NewsSlug.Of("  Große Straßenparty — 2027 "));
    }

    [Fact]
    public void Should_CutAtAWordBoundary_When_TheTitleIsTooLongForAnAddress()
    {
        var slug = NewsSlug.Of(string.Join(' ', Enumerable.Repeat("Konfettikanone", 12)));

        Assert.True(slug.Length <= NewsSlug.MaxLength);
        Assert.EndsWith("konfettikanone", slug, StringComparison.Ordinal);
    }

    [Fact]
    public void Should_FallBackToAPlainWord_When_TheTitleHasNoLetters()
    {
        Assert.Equal("meldung", NewsSlug.Of("!!! ???"));
    }

    [Fact]
    public void Should_CountUpFromTwo_When_TheAddressIsTaken()
    {
        Assert.Equal("prunksitzung", NewsSlug.FirstFreeOf("prunksitzung", []));
        Assert.Equal(
            "prunksitzung-3",
            NewsSlug.FirstFreeOf("prunksitzung", ["prunksitzung", "prunksitzung-2"])
        );
    }
}
