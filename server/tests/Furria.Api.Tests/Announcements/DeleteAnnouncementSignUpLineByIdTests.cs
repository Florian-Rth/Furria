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
public sealed class DeleteAnnouncementSignUpLineByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteAnnouncementSignUpLineByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("alice")]
    [InlineData("ilka")]
    public async Task Should_RemoveTheLine_When_TheAuthorOrAPosterRemovesIt(string callerAlias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await RemoveAsync(ctx, callerAlias, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.SignUpList(ctx.Club.SignUpLists.IdOf("helpers"))
            .ToHaveLines()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerNeitherWroteNorMayPostAnnouncements()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await RemoveAsync(ctx, "mara", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.SignUpList(ctx.Club.SignUpLists.IdOf("helpers"))
            .ToHaveLines((ctx.Identity.People.IdOf("chris"), "Bänke"))
            .AssertAsync(ct);
    }

    private Task<HttpResponseMessage> RemoveAsync(
        SeededContext ctx,
        string callerAlias,
        CancellationToken ct
    ) =>
        AtNowAsync(
            _fixture,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.DELETEAsync<
                    DeleteAnnouncementSignUpLineById,
                    DeleteAnnouncementSignUpLineByIdRequest
                >(new() { LineId = ctx.Club.SignUpLines.IdOf("chris-helps") });
            }
        );
}
