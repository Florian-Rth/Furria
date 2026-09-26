using Furria.Application;
using Furria.Application.ClubApp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.ClubApp;

public sealed class ClubAppOptionsTests
{
    private const string DebugFingerprint =
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5";
    private const string ReleaseFingerprint =
        "AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89";
    private const string FingerprintsKey = "ClubApp:AndroidCertFingerprints";

    [Fact]
    public void Should_ReadEveryFingerprint_When_TheyComeAsOneCommaSeparatedValue()
    {
        var options = ClubAppOptionsOf(
            new() { [FingerprintsKey] = $" {DebugFingerprint} ,\n{ReleaseFingerprint},, " }
        );

        Assert.Equal([DebugFingerprint, ReleaseFingerprint], options.AndroidCertFingerprints);
    }

    [Fact]
    public void Should_ReadEveryFingerprint_When_TheyComeAsAnArray()
    {
        var options = ClubAppOptionsOf(
            new()
            {
                [$"{FingerprintsKey}:0"] = DebugFingerprint,
                [$"{FingerprintsKey}:1"] = ReleaseFingerprint,
            }
        );

        Assert.Equal([DebugFingerprint, ReleaseFingerprint], options.AndroidCertFingerprints);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" , ")]
    public void Should_AcceptNoFingerprint_When_TheValueIsEmpty(string value)
    {
        var options = ClubAppOptionsOf(new() { [FingerprintsKey] = value });

        Assert.Empty(options.AndroidCertFingerprints);
    }

    [Fact]
    public void Should_RefuseTheOptions_When_AnEntryIsNoFingerprint()
    {
        Assert.Throws<OptionsValidationException>(() =>
            ClubAppOptionsOf(new() { [FingerprintsKey] = $"{DebugFingerprint},14:6D" })
        );
    }

    private static ClubAppOptions ClubAppOptionsOf(Dictionary<string, string?> fingerprints)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(fingerprints)
            .AddInMemoryCollection(
                new Dictionary<string, string?> { ["ClubApp:BaseUrl"] = "https://club.furria.de" }
            )
            .Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddApplication()
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<ClubAppOptions>>().Value;
    }
}
