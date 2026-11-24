using Furria.Application.ClubApp;
using Furria.Infrastructure.Identity;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class PasskeyRelyingPartyTests
{
    private const string DebugFingerprint =
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5";
    private const string DebugOrigin =
        "android:apk-key-hash:FG3pg8VzBlDY7rmVLzT8ZBagg0LmHb6oigSWsj_PROU";

    [Fact]
    public void Should_AcceptTheWebOriginAndEveryAndroidSigningKey_When_TheOriginsAreBuilt()
    {
        var origins = PasskeyRelyingParty.OriginsOf(
            new ClubAppOptions
            {
                BaseUrl = "https://club.furria.de/",
                AndroidCertFingerprints = [DebugFingerprint],
            }
        );

        Assert.Equal(
            [DebugOrigin, "https://club.furria.de"],
            origins.Order(StringComparer.Ordinal)
        );
    }

    [Theory]
    [InlineData("https://club.furria.de", false, true)]
    [InlineData("https://club.furria.de", true, false)]
    [InlineData("https://club.furria.de:8443", false, false)]
    [InlineData("https://evil.furria.de", false, false)]
    [InlineData(DebugOrigin, false, true)]
    public void Should_AcceptOnlyAListedSameOriginRequest_When_AnOriginIsChecked(
        string origin,
        bool crossOrigin,
        bool accepted
    )
    {
        var origins = PasskeyRelyingParty.OriginsOf(
            new ClubAppOptions
            {
                BaseUrl = "https://club.furria.de",
                AndroidCertFingerprints = [DebugFingerprint],
            }
        );

        Assert.Equal(accepted, PasskeyRelyingParty.IsAccepted(origins, origin, crossOrigin));
    }
}
