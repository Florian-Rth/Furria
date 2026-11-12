using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class PostAnnouncementReminderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostAnnouncementReminderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PushRunningMembersWithoutAnAnswer_When_TheAuthorRemindsTheAttendance()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var devices = await DevicesAsync(ctx, ct);
        var announcementId = ctx.Club.Announcements.IdOf("fest");

        var response = await RemindAtAsync(Now, ctx, "alice", Attendance(ctx), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await _fixture.PushesDrainedAsync(ct);
        var push = Assert.Single(PushesAt(_fixture, devices["mara"]));
        Assert.Equal($"Erinnerung: {Title}", TextOf(push, "title"));
        Assert.Equal("Bitte sag zu oder ab.", TextOf(push, "body"));
        Assert.Equal($"/announcements/{announcementId}", UrlOf(push));
        Assert.Single(PushesAt(_fixture, devices["ilka"]));
        Assert.Empty(PushesAt(_fixture, devices["chris"]));
        Assert.Empty(PushesAt(_fixture, devices["paula"]));
        Assert.Empty(PushesAt(_fixture, devices["rolf"]));
        Assert.Empty(PushesAt(_fixture, devices["alice"]));
        await ctx
            .Expected.Announcement(announcementId)
            .ToHaveAttendanceRemindedAt(Now)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_PushOnlyThoseWhoHaveNotVoted_When_APosterRemindsAPoll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var devices = await DevicesAsync(ctx, ct);
        var announcementId = ctx.Club.Announcements.IdOf("fest");
        var pollId = ctx.Club.Polls.IdOf("snack");

        var response = await RemindAtAsync(
            Now,
            ctx,
            "ilka",
            Reminder(ctx, AnnouncementAddOnKind.Poll, pollId),
            ct
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await _fixture.PushesDrainedAsync(ct);
        var push = Assert.Single(PushesAt(_fixture, devices["mara"]));
        Assert.Equal($"Bitte stimm ab: {SnackQuestion}", TextOf(push, "body"));
        Assert.Equal($"announcement-{announcementId}-reminder-poll-{pollId}", TextOf(push, "tag"));
        Assert.Single(PushesAt(_fixture, devices["alice"]));
        Assert.Empty(PushesAt(_fixture, devices["chris"]));
        Assert.Empty(PushesAt(_fixture, devices["ilka"]));
    }

    [Fact]
    public async Task Should_RefuseASecondReminder_When_SixHoursHaveNotPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        await DevicesAsync(ctx, ct);

        await RemindAtAsync(Now, ctx, "alice", Attendance(ctx), ct);
        var tooSoon = await RemindAtAsync(Now.AddHours(5), ctx, "alice", Attendance(ctx), ct);
        var inTime = await RemindAtAsync(Now.AddHours(6), ctx, "alice", Attendance(ctx), ct);

        Assert.Equal(HttpStatusCode.Conflict, tooSoon.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, inTime.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerNeitherWroteNorMayPostAnnouncements()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await RemindAtAsync(Now, ctx, "chris", Attendance(ctx), ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheReminder_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await RemindAtAsync(AfterTheLastDay, ctx, "alice", Attendance(ctx), ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePollHangsOnAnotherAnnouncement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            _fixture,
            ct,
            club =>
                club.AddAnnouncement("andere", "alice", "Andere", "Noch eins.", Now.AddDays(-1))
                    .AddAnnouncementPoll("fremd", "andere", "Wohin?", ["Hier", "Dort"])
        );

        var response = await RemindAtAsync(
            Now,
            ctx,
            "alice",
            Reminder(ctx, AnnouncementAddOnKind.Poll, ctx.Club.Polls.IdOf("fremd")),
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<HttpResponseMessage> RemindAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        PostAnnouncementReminderRequest request,
        CancellationToken ct
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.POSTAsync<
                    PostAnnouncementReminder,
                    PostAnnouncementReminderRequest
                >(request);
            }
        );

    private static PostAnnouncementReminderRequest Attendance(SeededContext ctx) =>
        Reminder(ctx, AnnouncementAddOnKind.Attendance, null);

    private static PostAnnouncementReminderRequest Reminder(
        SeededContext ctx,
        AnnouncementAddOnKind kind,
        int? addOnId
    ) =>
        new()
        {
            AnnouncementId = ctx.Club.Announcements.IdOf("fest"),
            Kind = kind,
            AddOnId = addOnId,
        };

    private async Task<IReadOnlyDictionary<string, string>> DevicesAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var run = Guid.NewGuid().ToString("N");
        var devices = new Dictionary<string, string>(StringComparer.Ordinal);
        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                foreach (var alias in new[] { "ilka", "alice", "chris", "mara", "paula", "rolf" })
                    devices[alias] = await SubscribedDeviceAsync(ctx, alias, $"{alias}-{run}", ct);
            }
        );

        return devices;
    }

    private static string TextOf(JsonElement push, string property) =>
        push.GetProperty(property).GetString() ?? "";
}
