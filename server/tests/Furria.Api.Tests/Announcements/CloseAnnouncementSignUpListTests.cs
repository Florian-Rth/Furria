using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Api.Endpoints.Calendar;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class CloseAnnouncementSignUpListTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public CloseAnnouncementSignUpListTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheListByHand_When_TheAuthorClosesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var listId = ctx.Club.SignUpLists.IdOf("helpers");

        var response = await CloseAsync(ctx, "alice", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.SignUpList(listId)
            .ToBeClosedAt(Now, ctx.Identity.People.IdOf("alice"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerNeitherWroteNorMayPostAnnouncements()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await CloseAsync(ctx, "chris", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.SignUpList(ctx.Club.SignUpLists.IdOf("helpers"))
            .ToBeClosedByHand(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheCalendarRouteIsGivenAnAnnouncementList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var listId = ctx.Club.SignUpLists.IdOf("helpers");

        var response = await AtNowAsync(
            _fixture,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync("ilka", ct);
                return await client.POSTAsync<
                    CloseCalendarSignUpList,
                    CloseCalendarSignUpListRequest
                >(new() { SignUpListId = listId });
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.SignUpList(listId).ToBeClosedByHand(false).AssertAsync(ct);
    }

    private Task<HttpResponseMessage> CloseAsync(
        SeededContext ctx,
        string callerAlias,
        CancellationToken ct
    ) =>
        AtNowAsync(
            _fixture,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.POSTAsync<
                    CloseAnnouncementSignUpList,
                    CloseAnnouncementSignUpListRequest
                >(new() { SignUpListId = ctx.Club.SignUpLists.IdOf("helpers") });
            }
        );
}
