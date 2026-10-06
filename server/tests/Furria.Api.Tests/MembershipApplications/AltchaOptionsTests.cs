using Furria.Api.Altcha;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class AltchaOptionsTests
{
    private const string HmacKey = "an-altcha-hmac-key-of-at-least-32-chars";

    [Fact]
    public void Should_IssueChallengesAsHardAsAltchaRecommends_When_NoDifficultyIsConfigured()
    {
        var options = AltchaOptionsOf(new() { ["Altcha:HmacKey"] = HmacKey });

        Assert.Equal(5_000, options.Cost);
        Assert.Equal(5_000, options.MinCounter);
        Assert.Equal(10_000, options.MaxCounter);
    }

    [Fact]
    public void Should_RefuseTheOptions_When_TheHmacKeyIsShorterThan32Characters()
    {
        Assert.Throws<OptionsValidationException>(() =>
            AltchaOptionsOf(new() { ["Altcha:HmacKey"] = new string('k', 31) })
        );
    }

    [Theory]
    [InlineData("0", "1", "2")]
    [InlineData("1", "-1", "2")]
    [InlineData("1", "3", "2")]
    public void Should_RefuseTheOptions_When_TheDifficultyCannotBeSolved(
        string cost,
        string minCounter,
        string maxCounter
    )
    {
        Assert.Throws<OptionsValidationException>(() =>
            AltchaOptionsOf(
                new()
                {
                    ["Altcha:HmacKey"] = HmacKey,
                    ["Altcha:Cost"] = cost,
                    ["Altcha:MinCounter"] = minCounter,
                    ["Altcha:MaxCounter"] = maxCounter,
                }
            )
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
