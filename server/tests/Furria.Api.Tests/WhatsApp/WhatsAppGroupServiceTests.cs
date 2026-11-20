using Furria.Application.Results;
using Furria.Infrastructure.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppGroupServiceTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChat = "120363001@g.us";
    private const string NewClubChat = "120363002@g.us";
    private const string ForeignChat = "120363003@g.us";

    private readonly ApiTestFixture _fixture;

    public WhatsAppGroupServiceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LinkOnlyTheNewChatToTheClub_When_AnotherClubGroupIsPicked()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        _fixture.Waha.JoinGroup(ClubChat, "FCC");
        _fixture.Waha.JoinGroup(NewClubChat, "FCC Verein");

        await PickClubGroupAsync(ClubChat, ct);
        var picked = await PickClubGroupAsync(NewClubChat, ct);

        Assert.True(picked.IsSuccess);
        var link = Assert.Single(await _fixture.LinkedWhatsAppGroupsAsync(ct));
        Assert.Equal((NewClubChat, (int?)null), link);
    }

    [Fact]
    public async Task Should_RefuseTheChat_When_TheBotIsNotInIt()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        _fixture.Waha.JoinGroup(ClubChat, "FCC");

        var picked = await PickClubGroupAsync(ForeignChat, ct);

        Assert.Equal(ResultErrorKind.NotFound, picked.Error.Kind);
        Assert.Empty(await _fixture.LinkedWhatsAppGroupsAsync(ct));
    }

    private async Task<Result> PickClubGroupAsync(string chatId, CancellationToken ct)
    {
        await using var scope = _fixture.Services.CreateAsyncScope();
        var groups = scope.ServiceProvider.GetRequiredService<WhatsAppGroupService>();

        return await groups.PickClubGroupAsync(chatId, ct);
    }
}
