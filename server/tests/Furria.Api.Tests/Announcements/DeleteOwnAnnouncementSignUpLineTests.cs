using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class DeleteOwnAnnouncementSignUpLineTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteOwnAnnouncementSignUpLineTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeHerLineOff_When_TheMemberWithdrawsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var listId = ctx.Club.SignUpLists.IdOf("helpers");

        var response = await WithdrawAtAsync(Now, ctx, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.SignUpList(listId).ToHaveLines().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerLine_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var listId = ctx.Club.SignUpLists.IdOf("helpers");

        var response = await WithdrawAtAsync(AfterTheLastDay, ctx, ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.SignUpList(listId)
            .ToHaveLines((ctx.Identity.People.IdOf("chris"), "Bänke"))
            .AssertAsync(ct);
    }

    private Task<HttpResponseMessage> WithdrawAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        CancellationToken ct
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync("chris", ct);
                return await client.DELETEAsync<
                    DeleteOwnAnnouncementSignUpLine,
                    DeleteOwnAnnouncementSignUpLineRequest
                >(new() { SignUpListId = ctx.Club.SignUpLists.IdOf("helpers") });
            }
        );
}
