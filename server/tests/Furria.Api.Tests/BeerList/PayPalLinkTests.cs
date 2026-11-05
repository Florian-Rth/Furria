using Furria.Core.BeerList;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PayPalLinkTests
{
    [Theory]
    [InlineData("https://paypal.me/gretageldbeutel")]
    [InlineData("https://www.paypal.me/gretageldbeutel/15")]
    [InlineData("https://www.paypal.com/paypalme/gretageldbeutel")]
    public void Should_Accept_When_TheLinkNamesAPayPalMeAccount(string link)
    {
        Assert.True(PayPalLink.IsValid(link));
    }

    [Theory]
    [InlineData("http://paypal.me/gretageldbeutel")]
    [InlineData("https://paypal.me/")]
    [InlineData("https://www.paypal.com/signin")]
    [InlineData("https://paypal.me.example.com/gretageldbeutel")]
    [InlineData("paypal.me/gretageldbeutel")]
    public void Should_Refuse_When_TheLinkLeadsAnywhereElse(string link)
    {
        Assert.False(PayPalLink.IsValid(link));
    }
}
