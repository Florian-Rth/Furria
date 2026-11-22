using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class GetWhatsAppQrCodeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetWhatsAppQrCodeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_GiveTheCurrentQrValue_When_TheSessionWaitsForAScan()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.HoldSession("SCAN_QR_CODE");

        var (response, result) = await client.GETAsync<
            GetWhatsAppQrCode,
            GetWhatsAppQrCodeResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(FakeWahaService.ScanningQrValue, result.Value);
    }

    [Fact]
    public async Task Should_RefuseTheQrCode_When_TheBotIsAlreadyLinked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot("4917612345678@c.us");

        var (response, _) = await client.GETAsync<GetWhatsAppQrCode, GetWhatsAppQrCodeResponse>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
