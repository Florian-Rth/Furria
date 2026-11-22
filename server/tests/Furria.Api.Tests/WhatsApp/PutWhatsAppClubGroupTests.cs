using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PutWhatsAppClubGroupTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChat = "120363001@g.us";
    private const string NewClubChat = "120363002@g.us";

    private readonly ApiTestFixture _fixture;

    public PutWhatsAppClubGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LinkOnlyTheNewChatToTheClub_When_AnotherClubGroupIsPicked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot("4917612345678@c.us");
        _fixture.Waha.JoinGroup(ClubChat, "FCC");
        _fixture.Waha.JoinGroup(NewClubChat, "FCC Verein");
        await PickAsync(client, ClubChat);

        var picked = await PickAsync(client, NewClubChat);

        Assert.Equal(HttpStatusCode.NoContent, picked.StatusCode);
        Assert.Equal([(NewClubChat, (int?)null)], await _fixture.LinkedWhatsAppGroupsAsync(ct));
    }

    [Fact]
    public async Task Should_RefuseTheChat_When_TheBotIsNotInIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot("4917612345678@c.us");

        var picked = await PickAsync(client, ClubChat);

        Assert.Equal(HttpStatusCode.NotFound, picked.StatusCode);
        Assert.Empty(await _fixture.LinkedWhatsAppGroupsAsync(ct));
    }

    private static Task<HttpResponseMessage> PickAsync(HttpClient client, string chatId) =>
        client.PUTAsync<PutWhatsAppClubGroup, PutWhatsAppClubGroupRequest>(
            new PutWhatsAppClubGroupRequest { ChatId = chatId }
        );
}
