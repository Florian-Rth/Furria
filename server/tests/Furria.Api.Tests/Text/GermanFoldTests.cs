using Furria.Core.Text;
using Xunit;

namespace Furria.Api.Tests.Text;

public sealed class GermanFoldTests
{
    [Fact]
    public void Should_WriteTheUmlautOut_When_TheValueIsExpanded()
    {
        Assert.Equal("mueller", GermanFold.Expand("Müller"));
        Assert.Equal("schoen", GermanFold.Expand("Schön"));
        Assert.Equal("baer", GermanFold.Expand("Bär"));
        Assert.Equal("strasse", GermanFold.Expand("Straße"));
    }

    [Fact]
    public void Should_KeepTheSpelling_When_TheValueIsAlreadyWrittenOut()
    {
        Assert.Equal("mueller", GermanFold.Expand("Mueller"));
    }

    [Fact]
    public void Should_DropTheUmlautDots_When_TheValueIsStripped()
    {
        Assert.Equal("muller", GermanFold.Strip("Müller"));
        Assert.Equal("schon", GermanFold.Strip("Schön"));
        Assert.Equal("bar", GermanFold.Strip("Bär"));
        Assert.Equal("strasse", GermanFold.Strip("Straße"));
    }

    [Fact]
    public void Should_DropAnyDiacritic_When_TheNameIsNotGerman()
    {
        Assert.Equal("cosic", GermanFold.Strip("Ćosić"));
        Assert.Equal("renee", GermanFold.Strip("Renée"));
    }

    [Fact]
    public void Should_KeepTheQueryUnchanged_When_ItCarriesNoUmlaut()
    {
        Assert.Equal("muller", GermanFold.Expand("muller"));
        Assert.Equal("muller", GermanFold.Strip("muller"));
    }

    [Fact]
    public void Should_ReturnTheEmptyString_When_TheValueIsEmpty()
    {
        Assert.Equal("", GermanFold.Expand(""));
        Assert.Equal("", GermanFold.Strip(""));
    }
}
