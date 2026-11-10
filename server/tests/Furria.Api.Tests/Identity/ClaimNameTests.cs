using Furria.Core.Identity;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class ClaimNameTests
{
    [Theory]
    [InlineData("Müller", "Mueller")]
    [InlineData("Jürgen-Peter", "juergen peter")]
    [InlineData("  JÜRGEN   Peter ", "Juergen - Peter")]
    [InlineData("Straßer", "STRASSER")]
    [InlineData("Renée", "Renee")]
    [InlineData("Ćosić", "cosic")]
    public void Should_ReadAlike_When_OnlySpellingDiffers(string recorded, string typed)
    {
        Assert.Equal(ClaimName.Normalize(recorded), ClaimName.Normalize(typed));
    }

    [Theory]
    [InlineData("Anna", "Anne")]
    [InlineData("Annalena", "Anna Lena")]
    [InlineData("Müller", "Muller")]
    public void Should_ReadApart_When_TheNamesDiffer(string recorded, string typed)
    {
        Assert.NotEqual(ClaimName.Normalize(recorded), ClaimName.Normalize(typed));
    }
}
