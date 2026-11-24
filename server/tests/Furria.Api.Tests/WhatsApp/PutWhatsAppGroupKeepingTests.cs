using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PutWhatsAppGroupKeepingTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChat = "120363001@g.us";
    private const string OtherChat = "120363002@g.us";

    private readonly ApiTestFixture _fixture;

    public PutWhatsAppGroupKeepingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SwitchKeepingOff_When_AnotherClubGroupIsPicked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        _fixture.Waha.LinkBot("4917612345678@c.us");
        _fixture.Waha.JoinGroup(ClubChat, "FCC Verein");
        _fixture.Waha.JoinGroup(OtherChat, "FCC Neu");
        await client.PUTAsync<PutWhatsAppClubGroup, PutWhatsAppClubGroupRequest>(
            new() { ChatId = ClubChat }
        );
        await client.PUTAsync<PutWhatsAppGroupKeeping, PutWhatsAppGroupKeepingRequest>(
            new() { KeepsMembers = true }
        );

        await client.PUTAsync<PutWhatsAppClubGroup, PutWhatsAppClubGroupRequest>(
            new() { ChatId = OtherChat }
        );

        var (_, overview) = await client.GETAsync<GetWhatsApp, GetWhatsAppResponse>();
        Assert.Equal((OtherChat, false), (overview.ClubChatId, overview.KeepsClubGroup));
    }
}
