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
public sealed class PutOwnAnnouncementSignUpLineTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutOwnAnnouncementSignUpLineTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AddHerLine_When_ARunningMemberSignsUp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var listId = ctx.Club.SignUpLists.IdOf("helpers");

        var response = await SignUpAtAsync(Now, ctx, "mara", "Zelt", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.SignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), "Bänke"),
                (ctx.Identity.People.IdOf("mara"), "Zelt")
            )
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("paula")]
    [InlineData("rolf")]
    public async Task Should_ReturnForbidden_When_TheReaderHoldsNoRunningUnpausedMembership(
        string readerAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await SignUpAtAsync(Now, ctx, readerAlias, "Zelt", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheLine_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await SignUpAtAsync(AfterTheLastDay, ctx, "mara", "Zelt", ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private Task<HttpResponseMessage> SignUpAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        string text,
        CancellationToken ct
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.PUTAsync<
                    PutOwnAnnouncementSignUpLine,
                    PutOwnAnnouncementSignUpLineRequest
                >(new() { SignUpListId = ctx.Club.SignUpLists.IdOf("helpers"), Text = text });
            }
        );
}
