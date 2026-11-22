using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Application.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class GetWhatsAppTests : IClassFixture<ApiTestFixture>
{
    private const string BotAccountId = "4917612345678@c.us";
    private const string ClubChat = "120363001@g.us";
    private const string OtherChat = "120363002@g.us";

    private readonly ApiTestFixture _fixture;

    public GetWhatsAppTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheBotGroupsWithTheClubGroupMarked_When_TheBotIsLinked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot(BotAccountId);
        _fixture.Waha.JoinGroup(OtherChat, "Tanzgarde");
        _fixture.Waha.JoinGroup(ClubChat, "FCC Verein");
        await client.PUTAsync<PutWhatsAppClubGroup, PutWhatsAppClubGroupRequest>(
            new PutWhatsAppClubGroupRequest { ChatId = ClubChat }
        );

        var (response, result) = await client.GETAsync<GetWhatsApp, GetWhatsAppResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(WhatsAppConnectionState.Working, result.State);
        Assert.Equal("+4917612345678", result.BotPhone);
        Assert.Equal(ClubChat, result.ClubChatId);
        Assert.Equal(
            [(ClubChat, "FCC Verein"), (OtherChat, "Tanzgarde")],
            result.Groups.Select(group => (group.ChatId, group.Name))
        );
    }

    [Fact]
    public async Task Should_ShowNoGroups_When_TheBotIsNotLinkedYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.JoinGroup(ClubChat, "FCC Verein");

        var (_, result) = await client.GETAsync<GetWhatsApp, GetWhatsAppResponse>();

        Assert.Equal(WhatsAppConnectionState.Stopped, result.State);
        Assert.Null(result.BotPhone);
        Assert.Empty(result.Groups);
    }

    [Fact]
    public async Task Should_ReportUnreachable_When_WahaDoesNotAnswer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.GoOffline();

        var (response, result) = await client.GETAsync<GetWhatsApp, GetWhatsAppResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(WhatsAppConnectionState.Unreachable, result.State);
        Assert.Empty(result.Groups);
    }
}
