using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Application.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PostWhatsAppSessionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostWhatsAppSessionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(null, "sessions")]
    [InlineData("STOPPED", "start")]
    [InlineData("FAILED", "restart")]
    public async Task Should_WaitForTheQrScan_When_LinkingStarts(
        string? heldStatus,
        string expectedCall
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        if (heldStatus is not null)
            _fixture.Waha.HoldSession(heldStatus);

        var started = await StartLinkingAsync(client);

        Assert.Equal(HttpStatusCode.NoContent, started.StatusCode);
        var (_, overview) = await client.GETAsync<GetWhatsApp, GetWhatsAppResponse>();
        Assert.Equal(WhatsAppConnectionState.ScanQrCode, overview.State);
        Assert.Equal(expectedCall, _fixture.Waha.LastSessionCall);
    }

    [Fact]
    public async Task Should_LeaveTheSessionAlone_When_TheBotIsAlreadyLinked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot("4917612345678@c.us");

        var started = await StartLinkingAsync(client);

        Assert.Equal(HttpStatusCode.NoContent, started.StatusCode);
        Assert.Null(_fixture.Waha.LastSessionCall);
    }

    [Fact]
    public async Task Should_RefuseToLink_When_WahaDoesNotAnswer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.GoOffline();

        var started = await StartLinkingAsync(client);

        Assert.Equal(HttpStatusCode.Conflict, started.StatusCode);
    }

    private static async Task<HttpResponseMessage> StartLinkingAsync(HttpClient client)
    {
        var (response, _) = await client.POSTAsync<EmptyRequest, EmptyResponse>(
            client.GetTestUrlFor<PostWhatsAppSession>(EmptyRequest.Instance),
            EmptyRequest.Instance
        );
        return response;
    }
}
