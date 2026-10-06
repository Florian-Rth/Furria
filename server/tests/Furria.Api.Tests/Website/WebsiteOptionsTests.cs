using Furria.Application;
using Furria.Application.Website;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class WebsiteOptionsTests
{
    [Fact]
    public void Should_ReadTheBaseUrl_When_ItIsAnAbsoluteWebUrl()
    {
        var options = WebsiteOptionsOf("https://furria.de");

        Assert.Equal("https://furria.de", options.BaseUrl);
    }

    [Theory]
    [InlineData("")]
    [InlineData("furria.de")]
    [InlineData("ftp://furria.de")]
    public void Should_RefuseTheOptions_When_TheBaseUrlIsNoAbsoluteWebUrl(string baseUrl)
    {
        Assert.Throws<OptionsValidationException>(() => WebsiteOptionsOf(baseUrl));
    }

    private static WebsiteOptions WebsiteOptionsOf(string baseUrl)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?> { ["Website:BaseUrl"] = baseUrl }
            )
            .Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddApplication()
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<WebsiteOptions>>().Value;
    }
}
