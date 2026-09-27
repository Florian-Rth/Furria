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

    [Theory]
    [InlineData("https://club.furria.de", "club.furria.de")]
    [InlineData("https://Club.Furria.de/app/", "club.furria.de")]
    [InlineData("http://localhost:3001", "localhost")]
    public void Should_UseTheHostAsTheDomain_When_TheBaseUrlIsRead(string baseUrl, string domain)
    {
        Assert.Equal(domain, PasskeyRelyingParty.DomainOf(baseUrl));
    }

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

    [Fact]
    public void Should_KeepThePort_When_TheBaseUrlNamesOne()
    {
        var origins = PasskeyRelyingParty.OriginsOf(
            new ClubAppOptions { BaseUrl = "http://localhost:3001" }
        );

        Assert.Equal(["http://localhost:3001"], origins);
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

    [Theory]
    [InlineData(DebugFingerprint, true)]
    [InlineData(
        "14:6d:e9:83:c5:73:06:50:d8:ee:b9:95:2f:34:fc:64:16:a0:83:42:e6:1d:be:a8:8a:04:96:b2:3f:cf:44:e5",
        true
    )]
    [InlineData("14:6D:E9:83", false)]
    [InlineData("146DE983C5730650D8EEB9952F34FC6416A08342E61DBEA88A0496B23FCF44E5", false)]
    [InlineData(
        "ZZ:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5",
        false
    )]
    public void Should_ReadOnlyTheKeytoolForm_When_AFingerprintIsParsed(
        string fingerprint,
        bool readable
    )
    {
        Assert.Equal(readable, AndroidCertFingerprint.BytesOf(fingerprint) is not null);
    }
}
