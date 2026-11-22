using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PostWhatsAppPairingCodeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostWhatsAppPairingCodeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("0176 1234 5678")]
    [InlineData("+49 176 12345678")]
    [InlineData("0049-176-12345678")]
    [InlineData("+49 (0)176 12345678")]
    public async Task Should_RequestTheCodeForTheInternationalNumber_When_TheBotNumberIsGiven(
        string phoneNumber
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.HoldSession("SCAN_QR_CODE");

        var (response, result) = await client.POSTAsync<
            PostWhatsAppPairingCode,
            PostWhatsAppPairingCodeRequest,
            PostWhatsAppPairingCodeResponse
        >(new PostWhatsAppPairingCodeRequest { PhoneNumber = phoneNumber });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(FakeWahaService.PairingCode, result.Code);
        Assert.Equal("4917612345678", _fixture.Waha.PairingPhoneNumber);
    }

    [Theory]
    [InlineData("")]
    [InlineData("0176")]
    [InlineData("hallo")]
    public async Task Should_RejectTheNumber_When_ItIsNoPhoneNumber(string phoneNumber)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.HoldSession("SCAN_QR_CODE");

        var (response, _) = await client.POSTAsync<
            PostWhatsAppPairingCode,
            PostWhatsAppPairingCodeRequest,
            PostWhatsAppPairingCodeResponse
        >(new PostWhatsAppPairingCodeRequest { PhoneNumber = phoneNumber });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null(_fixture.Waha.PairingPhoneNumber);
    }

    [Fact]
    public async Task Should_RefuseTheCode_When_LinkingHasNotStarted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await client.POSTAsync<
            PostWhatsAppPairingCode,
            PostWhatsAppPairingCodeRequest,
            PostWhatsAppPairingCodeResponse
        >(new PostWhatsAppPairingCodeRequest { PhoneNumber = "017612345678" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Null(_fixture.Waha.PairingPhoneNumber);
    }
}
