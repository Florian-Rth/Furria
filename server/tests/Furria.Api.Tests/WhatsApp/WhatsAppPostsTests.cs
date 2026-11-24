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
            $"📌 `FCC · AUSHANG`\n*{Title}*\n\nBitte *pünktlich*.\n\n_Bea Aushang_\n↗ {ApiTestFixture.ClubAppBaseUrl}/announcements/{announcementId}",
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

    [Fact]
    public async Task Should_FollowThePostWithItsAddOnsInTheAuthorsOrder_When_AnAnnouncementIsNotified()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);

        var announcementId = await PostAnnouncementAsync(
            ctx,
            new PostAnnouncementRequest
            {
                Title = Title,
                Body = "Wer hilft mit?",
                ValidUntil = null,
                AddOns =
                [
                    AnnouncementPoll("Welche Uhrzeit?", true, false, "10 Uhr", "14 Uhr"),
                    AnnouncementAttendance(),
                    AnnouncementSignUpList("Mitbringliste"),
                    AnnouncementPoll("Wer putzt die Küche?", false, true, "Ich", "Du"),
                ],
                Notify = true,
            },
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var link = $"{ApiTestFixture.ClubAppBaseUrl}/announcements/{announcementId}";
        Assert.Equal(
            [
                (
                    "sendText",
                    $"📌 `FCC · AUSHANG`\n*{Title}*\n\nWer hilft mit?\n\n_Bea Aushang_\n↗ {link}"
                ),
                ("sendPoll", "Welche Uhrzeit?"),
                ("sendPoll", Title),
                ("sendText", $"📝 `FCC · EINTRAGSLISTE`\nEintragen: *Mitbringliste*\n↗ {link}"),
                (
                    "sendText",
                    $"🗳️ `FCC · ABSTIMMUNG`\nAnonym abstimmen: *Wer putzt die Küche?*\n↗ {link}"
                ),
            ],
            _fixture.Waha.Sent.Select(sent => (sent.Kind, sent.Text))
        );
        Assert.Equal(
            [("10 Uhr|14 Uhr", true), ("Ja|Nein|Vielleicht", false)],
            _fixture
                .Waha.Sent.Where(sent => sent.Kind == "sendPoll")
                .Select(sent => (string.Join('|', sent.Options), sent.AllowsSeveralAnswers))
        );

        var polls = await _fixture.PollIdsByQuestionAsync(ct);
        var lists = await _fixture.SignUpListIdsByTitleAsync(ct);
        var records = await _fixture.WhatsAppPostRecordsAsync(ct);
        Assert.Equal(
            [
                (null, null, ""),
                (WhatsAppAddOnKind.Poll, polls["Welche Uhrzeit?"], "10 Uhr|14 Uhr"),
                (WhatsAppAddOnKind.Attendance, null, "Ja|Nein|Vielleicht"),
                (WhatsAppAddOnKind.SignUpList, lists["Mitbringliste"], ""),
                (WhatsAppAddOnKind.Poll, polls["Wer putzt die Küche?"], ""),
            ],
            records.Select(record =>
                (record.AddOnKind, record.AddOnId, string.Join('|', record.PollOptions))
            )
        );
        Assert.All(
            records,
            record =>
                Assert.Equal(
                    (WhatsAppHostKind.Announcement, announcementId),
                    (record.HostKind, record.HostId)
                )
        );
        Assert.Equal(
            _fixture.Waha.Sent.Select(sent => sent.MessageId),
            records.Select(record => record.MessageId)
        );
        Assert.Equal(
            await _fixture.PollOptionIdsAsync(polls["Welche Uhrzeit?"] ?? 0, ct),
            records[1].PollOptionIds
        );
        Assert.Empty(records[2].PollOptionIds);
    }

    [Fact]
    public async Task Should_LinkThePollInstead_When_ItHasMoreAnswersThanAWhatsAppPollHolds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        string[] thirteenDates = [.. Enumerable.Range(1, 13).Select(day => $"{day}. Mai")];

        var announcementId = await PostAnnouncementAsync(
            ctx,
            new PostAnnouncementRequest
            {
                Title = Title,
                Body = "Termin gesucht.",
                ValidUntil = null,
                AddOns = [AnnouncementPoll("Welcher Tag?", true, false, thirteenDates)],
                Notify = true,
            },
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        Assert.Equal(["sendText", "sendText"], _fixture.Waha.Sent.Select(sent => sent.Kind));
        Assert.Equal(
            $"🗳️ `FCC · ABSTIMMUNG`\nAbstimmen: *Welcher Tag?*\n↗ {ApiTestFixture.ClubAppBaseUrl}/announcements/{announcementId}",
            _fixture.Waha.Sent[1].Text
        );
    }

    private static Task<int> PostAnnouncementAsync(
        SeededContext ctx,
        string body,
        bool notify,
        CancellationToken ct
    ) =>
        PostAnnouncementAsync(
            ctx,
            new PostAnnouncementRequest
            {
                Title = Title,
                Body = body,
                ValidUntil = null,
                AddOns = [],
                Notify = notify,
            },
            ct
        );

    private static async Task<int> PostAnnouncementAsync(
        SeededContext ctx,
        PostAnnouncementRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.AnnouncementId;
    }

    private static PostAnnouncementAddOnDataDto AnnouncementAttendance() =>
        new()
        {
            Kind = AnnouncementAddOnKind.Attendance,
            Attendance = new() { AnswersUntil = null },
            Poll = null,
            SignUpList = null,
            Borrowed = null,
        };

    private static PostAnnouncementAddOnDataDto AnnouncementPoll(
        string question,
        bool allowsMultipleChoices,
        bool isAnonymous,
        params string[] labels
    ) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Poll,
            Attendance = null,
            Poll = new()
            {
                PollId = null,
                Question = question,
                AllowsMultipleChoices = allowsMultipleChoices,
                IsAnonymous = isAnonymous,
                VotesUntil = null,
                Options =
                [
                    .. labels.Select(label => new PostAnnouncementPollOptionDataDto
                    {
                        OptionId = null,
                        Label = label,
                    }),
                ],
            },
            SignUpList = null,
            Borrowed = null,
        };

    private static PostAnnouncementAddOnDataDto AnnouncementSignUpList(string title) =>
        new()
        {
            Kind = AnnouncementAddOnKind.SignUpList,
            Attendance = null,
            Poll = null,
            SignUpList = new()
            {
                SignUpListId = null,
                Title = title,
                Hint = null,
                SignUpUntil = null,
            },
            Borrowed = null,
        };

    private static PostAnnouncementAddOnDataDto Borrowed(
        AnnouncementAddOnKind kind,
        int calendarEntryId,
        int? addOnId
    ) =>
        new()
        {
            Kind = kind,
            Attendance = null,
            Poll = null,
            SignUpList = null,
            Borrowed = new() { CalendarEntryId = calendarEntryId, AddOnId = addOnId },
        };

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
