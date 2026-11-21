using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppPostsTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChatId = "120363000000000001@g.us";
    private const string Title = "Saalreinigung";
    private const string ClubMeeting = "Vereinssitzung";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset MeetingEnd = new(2027, 1, 20, 21, 0, 0, TimeSpan.Zero);
    private static readonly TimeSpan RetryWaitTimeout = TimeSpan.FromSeconds(30);

    private readonly ApiTestFixture _fixture;

    public WhatsAppPostsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PostTheAnnouncementIntoTheClubGroup_When_ItIsNotified()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);

        var announcementId = await PostAnnouncementAsync(ctx, "Bitte **pünktlich**.", true, ct);

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var sent = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal(("sendText", ClubChatId), (sent.Kind, sent.ChatId));
        Assert.Equal(
            $"*{Title}*\n\nBitte *pünktlich*.\n\n_Bea Aushang_\n{ApiTestFixture.ClubAppBaseUrl}/announcements/{announcementId}",
            sent.Text
        );
        var record = Assert.Single(await _fixture.WhatsAppPostRecordsAsync(ct));
        Assert.Equal(
            (WhatsAppHostKind.Announcement, announcementId, ClubChatId, sent.MessageId),
            (record.HostKind, record.HostId, record.ChatId, record.MessageId)
        );
        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
    }

    [Fact]
    public async Task Should_MentionThePersonByPhone_When_HerNumberIsKnown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        var aliceId = ctx.Identity.People.IdOf("alice");
        var beaId = ctx.Identity.People.IdOf("bea");

        await PostAnnouncementAsync(
            ctx,
            $"Danke @[Alice Muster](person:{aliceId}) und @[Bea Aushang](person:{beaId}).",
            true,
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var sent = Assert.Single(_fixture.Waha.Sent);
        Assert.StartsWith($"*{Title}*\n\nDanke @491701234567 und Bea Aushang.", sent.Text);
        Assert.Equal(["491701234567@c.us"], sent.Mentions);
    }

    [Fact]
    public async Task Should_PostNothing_When_TheAuthorDoesNotNotify()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);

        await PostAnnouncementAsync(ctx, "Ohne Benachrichtigung.", false, ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
        Assert.Empty(_fixture.Waha.Sent);
    }

    [Fact]
    public async Task Should_PostNothing_When_NoClubGroupIsLinked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        await PostAnnouncementAsync(ctx, "Niemand liest mit.", true, ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
    }

    [Fact]
    public async Task Should_PostTheEntryWithItsDateLine_When_AClubEntryIsNotified()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);

        var entryId = await CreateEntryAsync(
            ctx,
            ClubEntry(ctx) with
            {
                Description = "Tagesordnung folgt.",
                AddOns =
                [
                    new()
                    {
                        Kind = CalendarEntryAddOnKind.DaySchedule,
                        Poll = null,
                        SignUpList = null,
                        DaySchedule = new()
                        {
                            DayScheduleId = null,
                            Title = null,
                            Steps =
                            [
                                new()
                                {
                                    StepId = null,
                                    Day = 0,
                                    Time = new TimeOnly(19, 30),
                                    Text = "Begrüßung",
                                },
                            ],
                        },
                    },
                    new()
                    {
                        Kind = CalendarEntryAddOnKind.ParticipatingGroups,
                        Poll = null,
                        SignUpList = null,
                        DaySchedule = null,
                    },
                ],
                ParticipatingGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
            },
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var sent = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal(
            $"*{ClubMeeting}*\nMi 20.1. · 19:00–22:00 Uhr · Bühnenhaus\n\nTagesordnung folgt.\n\n19:30 Begrüßung\n\nDabei: Tanzgarde\n\n_Ilka Kalender_\n{ApiTestFixture.ClubAppBaseUrl}/calendar/{entryId}",
            sent.Text
        );
        var record = Assert.Single(await _fixture.WhatsAppPostRecordsAsync(ct));
        Assert.Equal((WhatsAppHostKind.CalendarEntry, entryId), (record.HostKind, record.HostId));
    }

    [Fact]
    public async Task Should_PostNothing_When_TheNotifiedEntryAddressesGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);

        await CreateEntryAsync(
            ctx,
            ClubEntry(ctx) with
            {
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
            },
            ct
        );

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
    }

    [Fact]
    public async Task Should_KeepThePostForARetry_When_WhatsAppRefusesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        _fixture.Waha.RefuseSends(HttpStatusCode.InternalServerError, "{\"error\":\"boom\"}");

        await PostAnnouncementAsync(ctx, "Kommt später an.", true, ct);

        var retrying = await Polling.UntilAsync(
            async token =>
                (await _fixture.WhatsAppOutboxAsync(token)).SingleOrDefault(row =>
                    row.Attempt == 2
                ),
            RetryWaitTimeout,
            "The refused post was never scheduled for a retry",
            ct
        );
        Assert.Equal(
            (_fixture.TimeProvider.GetUtcNow() + TimeSpan.FromSeconds(30), (DateTimeOffset?)null),
            (retrying.NextAttemptAt, retrying.FailedAt)
        );
        Assert.Empty(_fixture.Waha.Sent);
        Assert.Empty(await _fixture.WhatsAppPostRecordsAsync(ct));
    }

    private static async Task<int> PostAnnouncementAsync(
        SeededContext ctx,
        string body,
        bool notify,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = body,
                ValidUntil = null,
                AddOns = [],
                Notify = notify,
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.AnnouncementId;
    }

    private static async Task<int> CreateEntryAsync(
        SeededContext ctx,
        PostCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.CalendarEntryId;
    }

    private static PostCalendarEntryRequest ClubEntry(SeededContext ctx) =>
        new()
        {
            Title = ClubMeeting,
            Description = null,
            OwnerGroupId = null,
            VenueId = ctx.Club.Venues.IdOf("buehnenhaus"),
            StartsAt = MeetingStart,
            EndsAt = MeetingEnd,
            Kind = CalendarEntryKind.Plain,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
            Notify = true,
        };

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddPersonContact("alice", phone: "0170 1234567")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Aushang")
                            .AddAccount("bea")
                            .AddMembership("bea-first", "bea", JoinedIn2017)
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "aushangwart",
                                "bea-aushangwart",
                                "Aushangwart",
                                "bea",
                                FurriaPermissions.AnnouncementsPost
                            )
                            .AddRoleWithHolder(
                                "terminpflege",
                                "ilka-terminpflege",
                                "Terminpflege",
                                "ilka",
                                FurriaPermissions.CalendarManageClub
                            )
                    )
                    .Club(club => club.AddVenue("buehnenhaus", "Bühnenhaus")),
            ct
        );
}
