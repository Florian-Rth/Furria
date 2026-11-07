using Furria.Core.Website;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class WebsiteAddressTests
{
    [Theory]
    [InlineData(7, "1. Prunksitzung", "7-1-prunksitzung")]
    [InlineData(
        12,
        "Männerballett & Große Straßenparty!",
        "12-maennerballett-grosse-strassenparty"
    )]
    [InlineData(3, "Café Crème — Élan", "3-cafe-creme-elan")]
    [InlineData(5, "  Ölfass  ", "5-oelfass")]
    [InlineData(9, "!!! ???", "9")]
    public void Should_WriteTheAddressTheWebsiteLinks_When_ATitleIsTurnedIntoASlug(
        int id,
        string title,
        string slug
    )
    {
        Assert.Equal(slug, WebsiteAddress.IdSlugOf(id, title));
    }

    [Theory]
    [InlineData("7-1-prunksitzung", 7)]
    [InlineData("7", 7)]
    [InlineData("7-anything-else", 7)]
    [InlineData("prunksitzung-7", null)]
    [InlineData("7prunksitzung", null)]
    [InlineData("0-null", null)]
    [InlineData("99999999999-zu-gross", null)]
    public void Should_AddressByTheLeadingId_When_ASlugIsRead(string slug, int? id)
    {
        Assert.Equal(id, WebsiteAddress.IdOf(slug));
    }
}
