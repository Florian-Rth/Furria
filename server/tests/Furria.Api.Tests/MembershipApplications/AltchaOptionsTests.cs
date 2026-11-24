using Furria.Api.Altcha;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class AltchaOptionsTests
{
    [Fact]
    public void Should_RefuseTheOptions_When_TheHmacKeyIsShorterThan32Characters()
    {
        Assert.Throws<OptionsValidationException>(() =>
            AltchaOptionsOf(new() { ["Altcha:HmacKey"] = new string('k', 31) })
        );
    }

    private static AltchaOptions AltchaOptionsOf(Dictionary<string, string?> settings)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddAltchaProofOfWork()
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<AltchaOptions>>().Value;
    }
}
