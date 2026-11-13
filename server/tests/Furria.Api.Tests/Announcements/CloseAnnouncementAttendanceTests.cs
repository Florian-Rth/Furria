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
public sealed class CloseAnnouncementAttendanceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public CloseAnnouncementAttendanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("alice")]
    [InlineData("ilka")]
    public async Task Should_CloseTheAttendanceByHand_When_TheAuthorOrAPosterClosesIt(
        string callerAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await CloseAsync(ctx, callerAlias, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(ctx.Club.Announcements.IdOf("fest"))
            .ToHaveAttendanceClosed(Now, ctx.Identity.People.IdOf(callerAlias))
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
            .Expected.Announcement(ctx.Club.Announcements.IdOf("fest"))
            .ToHaveAttendanceClosed(null, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampTheDeadline_When_TheAnswersAlreadyEndedByTheirOwnTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            _fixture,
            ct,
            club =>
                club.AddAnnouncement(
                    "frist",
                    "alice",
                    "Frist",
                    "Antworten bis gestern.",
                    Now.AddDays(-3),
                    attendance: new AnnouncementAttendanceIntent(AnswersUntil: Now.AddDays(-1))
                )
        );

        var response = await CloseAsync(ctx, "alice", ct, ctx.Club.Announcements.IdOf("frist"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(ctx.Club.Announcements.IdOf("frist"))
            .ToHaveAttendanceClosed(Now.AddDays(-1), null)
            .AssertAsync(ct);
    }

    private Task<HttpResponseMessage> CloseAsync(
        SeededContext ctx,
        string callerAlias,
        CancellationToken ct,
        int? announcementId = null
    ) =>
        AtNowAsync(
            _fixture,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.POSTAsync<
                    CloseAnnouncementAttendance,
                    CloseAnnouncementAttendanceRequest
                >(new() { AnnouncementId = announcementId ?? ctx.Club.Announcements.IdOf("fest") });
            }
        );
}
