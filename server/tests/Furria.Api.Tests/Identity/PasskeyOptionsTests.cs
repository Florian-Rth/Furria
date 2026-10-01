using Furria.Application;
using Furria.Application.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class PasskeyOptionsTests
{
    [Theory]
    [InlineData("furria.de", "https://app.furria.de")]
    [InlineData("florianrth.com", "https://furria-app.florianrth.com")]
    [InlineData("furria.de", "https://App.Furria.de/")]
    [InlineData("app.furria.de", "https://app.furria.de")]
    [InlineData("localhost", "http://localhost:3001")]
    public void Should_UseTheClubDomain_When_ItCoversTheClubAppsHost(
        string relyingPartyId,
        string clubAppBaseUrl
    )
    {
        var options = PasskeyOptionsOf(relyingPartyId, clubAppBaseUrl);

        Assert.Equal(relyingPartyId, options.RelyingPartyId);
    }

    [Theory]
    [InlineData("", "https://app.furria.de")]
    [InlineData("furria.de", "https://app.notfurria.de")]
    [InlineData("furria.de", "https://furria-app.florianrth.com")]
    [InlineData("app.furria.de", "https://furria.de")]
    [InlineData("https://furria.de", "https://app.furria.de")]
    [InlineData("furria.de:443", "https://app.furria.de")]
    public void Should_RefuseTheOptions_When_TheRelyingPartyDoesNotCoverTheClubAppsHost(
        string relyingPartyId,
        string clubAppBaseUrl
    )
    {
        Assert.Throws<OptionsValidationException>(() =>
            PasskeyOptionsOf(relyingPartyId, clubAppBaseUrl)
        );
    }

    private static PasskeyOptions PasskeyOptionsOf(string relyingPartyId, string clubAppBaseUrl)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Passkeys:RelyingPartyId"] = relyingPartyId,
                    ["ClubApp:BaseUrl"] = clubAppBaseUrl,
                }
            )
            .Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddApplication()
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<PasskeyOptions>>().Value;
    }
}
