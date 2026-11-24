using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class PostAnnouncementAnswerTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostAnnouncementAnswerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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

        var response = await AnswerAtAsync(Now, ctx, readerAlias, AttendanceAnswer.Yes, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheAnswer_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await AnswerAtAsync(AfterTheLastDay, ctx, "mara", AttendanceAnswer.Yes, ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Theory]
    [InlineData("frist")]
    [InlineData("geschlossen")]
    public async Task Should_RefuseTheAnswer_When_TheAttendanceIsClosed(string announcementAlias)
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
                    .AddAnnouncement(
                        "geschlossen",
                        "alice",
                        "Geschlossen",
                        "Von Hand geschlossen.",
                        Now.AddDays(-3),
                        attendance: new AnnouncementAttendanceIntent(ClosedAt: Now.AddHours(-1))
                    )
        );

        var response = await AnswerAtAsync(
            Now,
            ctx,
            "mara",
            AttendanceAnswer.Yes,
            ct,
            ctx.Club.Announcements.IdOf(announcementAlias)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private Task<HttpResponseMessage> AnswerAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        AttendanceAnswer answer,
        CancellationToken ct,
        int? announcementId = null
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.POSTAsync<
                    PostAnnouncementAnswer,
                    PostAnnouncementAnswerRequest
                >(
                    new()
                    {
                        AnnouncementId = announcementId ?? ctx.Club.Announcements.IdOf("fest"),
                        Answer = answer,
                    }
                );
            }
        );
}
