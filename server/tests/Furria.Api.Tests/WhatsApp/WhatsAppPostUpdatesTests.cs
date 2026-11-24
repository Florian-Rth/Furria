using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppPostUpdatesTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChatId = "120363000000000001@g.us";
    private const string ClubMeeting = "Vereinssitzung";
    private const string CakeQuestion = "Wer bringt Kuchen?";
    private const string Title = "Saalreinigung";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset MeetingEnd = new(2027, 1, 20, 21, 0, 0, TimeSpan.Zero);
    private static readonly TimeSpan PastTheEditWindow = TimeSpan.FromMinutes(20);
    private static readonly TimeSpan PastTheDeleteWindow = TimeSpan.FromDays(3);
    private static readonly TimeSpan ReplyTimeout = TimeSpan.FromSeconds(30);

    private readonly ApiTestFixture _fixture;

    public WhatsAppPostUpdatesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EditThePost_When_TheEntryIsEditedSoonAfterPosting()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = await CreateNotifiedEntryAsync(ctx, [], ct);
        var post = await PostedAsync("sendText", ct);

        await PutEntryAsync(
            ctx,
            Edited(ctx, entryId) with
            {
                Description = "Neue Tagesordnung.",
            },
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var edit = Assert.Single(_fixture.Waha.Sent, sent => sent.Kind == "edit");
        Assert.Equal(
            (
                post.MessageId,
                $"📅 `FCC · TERMIN`\n*{ClubMeeting}*\nMi 20.1. · 19:00–22:00 Uhr · Bühnenhaus\n\nNeue Tagesordnung.\n\n_Ilka Kalender_\n↗ {EntryLink(entryId)}"
            ),
            (edit.MessageId, edit.Text)
        );
    }

    [Fact]
    public async Task Should_LeaveThePost_When_TheEditComesAfterWhatsAppsEditWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = await CreateNotifiedEntryAsync(ctx, [], ct);
        await PostedAsync("sendText", ct);
        await _fixture.AgeWhatsAppPostsAsync(PastTheEditWindow, ct);

        await PutEntryAsync(ctx, Edited(ctx, entryId) with { Description = "Zu spät." }, ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
        Assert.Single(_fixture.Waha.Sent);
    }

    [Fact]
    public async Task Should_DeleteThePostAndItsAddOns_When_TheEntryIsDeletedWithinTwoDays()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = await CreateNotifiedEntryAsync(ctx, [CakePoll()], ct);
        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var posted = _fixture.Waha.Sent.Select(sent => sent.MessageId).ToList();

        await DeleteEntryAsync(ctx, entryId, ct);

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        Assert.Equal(
            posted,
            _fixture.Waha.Sent.Where(sent => sent.Kind == "delete").Select(sent => sent.MessageId)
        );
        Assert.Empty(await _fixture.WhatsAppPostRecordsAsync(ct));
    }

    [Fact]
    public async Task Should_ReplyAbgesagt_When_TheEntryIsDeletedAfterWhatsAppsDeleteWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = await CreateNotifiedEntryAsync(ctx, [CakePoll()], ct);
        var post = await PostedAsync("sendText", ct);
        await _fixture.AgeWhatsAppPostsAsync(PastTheDeleteWindow, ct);

        await DeleteEntryAsync(ctx, entryId, ct);

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var reply = Assert.Single(_fixture.Waha.Sent, sent => sent.ReplyTo is not null);
        Assert.Equal(
            (post.MessageId, "🚫 `FCC · ABGESAGT`\nFindet nicht statt."),
            (reply.ReplyTo, reply.Text)
        );
        Assert.DoesNotContain(_fixture.Waha.Sent, sent => sent.Kind == "delete");
        Assert.Empty(await _fixture.WhatsAppPostRecordsAsync(ct));
    }

    [Fact]
    public async Task Should_DropTheUndeliveredPost_When_TheAnnouncementIsWithdrawnBeforeItWasSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        _fixture.Waha.RefuseSends(HttpStatusCode.InternalServerError, "{\"error\":\"boom\"}");
        var announcementId = await PostAnnouncementAsync(ctx, ct);
        await Polling.UntilAsync(
            async token =>
                (await _fixture.WhatsAppOutboxAsync(token)).FirstOrDefault(row => row.Attempt == 2),
            ReplyTimeout,
            "The refused post was never scheduled for a retry",
            ct
        );

        await WithdrawAsync(ctx, announcementId, ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
        Assert.Empty(_fixture.Waha.Sent);
    }

    [Fact]
    public async Task Should_ReplyWithTheResult_When_ThePollClosesByTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var votesUntil = _fixture.TimeProvider.GetUtcNow().AddHours(1);
        await CreateNotifiedEntryAsync(ctx, [CakePoll(votesUntil)], ct);
        var poll = await PostedAsync("sendPoll", ct);

        _fixture.TimeProvider.SetUtcNow(votesUntil.AddMinutes(1));

        var reply = await RepliedToAsync(poll.MessageId, ct);
        Assert.Equal("📊 `FCC · ERGEBNIS`\n*Abstimmung beendet*\nIch: 0\nNicht ich: 0", reply.Text);
    }

    [Fact]
    public async Task Should_RepostThePollAndRepointItsRecord_When_ItsAnswersChange()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = await CreateNotifiedEntryAsync(ctx, [CakePoll()], ct);
        var oldPoll = await PostedAsync("sendPoll", ct);
        var pollId = (await _fixture.PollIdsByQuestionAsync(ct))[CakeQuestion] ?? 0;
        var optionIds = await _fixture.PollOptionIdsAsync(pollId, ct);
        var recordId = (await _fixture.WhatsAppPostRecordsAsync(ct))
            .Single(record => record.AddOnKind == WhatsAppAddOnKind.Poll)
            .Id;

        await PutEntryAsync(
            ctx,
            Edited(ctx, entryId) with
            {
                AddOns =
                [
                    PutCakePoll(
                        pollId,
                        (optionIds[0], "Ich"),
                        (optionIds[1], "Nicht ich"),
                        (null, "Vielleicht")
                    ),
                ],
            },
            ct
        );

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var deleted = Assert.Single(_fixture.Waha.Sent, sent => sent.Kind == "delete");
        Assert.Equal(oldPoll.MessageId, deleted.MessageId);
        var newPoll = _fixture.Waha.Sent.Last(sent => sent.Kind == "sendPoll");
        Assert.Equal(["Ich", "Nicht ich", "Vielleicht"], newPoll.Options);
        var record = (await _fixture.WhatsAppPostRecordsAsync(ct)).Single(record =>
            record.AddOnKind == WhatsAppAddOnKind.Poll
        );
        Assert.Equal(
            (recordId, newPoll.MessageId, "Ich|Nicht ich|Vielleicht"),
            (record.Id, record.MessageId, string.Join('|', record.PollOptions))
        );
        Assert.Equal(await _fixture.PollOptionIdsAsync(pollId, ct), record.PollOptionIds);
    }

    private async Task<FakeWahaSend> PostedAsync(string kind, CancellationToken ct)
    {
        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        return Assert.Single(_fixture.Waha.Sent, sent => sent.Kind == kind);
    }

    private Task<FakeWahaSend> RepliedToAsync(string messageId, CancellationToken ct) =>
        Polling.UntilAsync(
            _ =>
                Task.FromResult(
                    _fixture.Waha.Sent.SingleOrDefault(sent => sent.ReplyTo == messageId)
                ),
            ReplyTimeout,
            "No reply to the add-on was ever sent",
            ct
        );

    private async Task<int> CreateNotifiedEntryAsync(
        SeededContext ctx,
        IReadOnlyList<PostCalendarEntryAddOnDataDto> addOns,
        CancellationToken ct
    )
    {
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
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
                AddOns = addOns,
                ParticipatingGroupIds = [],
                Notify = true,
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.CalendarEntryId;
    }

    private static PutCalendarEntryRequest Edited(SeededContext ctx, int entryId) =>
        new()
        {
            CalendarEntryId = entryId,
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
        };

    private static async Task PutEntryAsync(
        SeededContext ctx,
        PutCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static async Task DeleteEntryAsync(SeededContext ctx, int entryId, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var deleted = await client.DELETEAsync<
            DeleteCalendarEntryById,
            DeleteCalendarEntryByIdRequest
        >(new() { CalendarEntryId = entryId });
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
    }

    private async Task<int> PostAnnouncementAsync(
        SeededContext ctx,
        CancellationToken ct,
        params PostAnnouncementAddOnDataDto[] addOns
    )
    {
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = "Bitte helfen.",
                ValidUntil = null,
                AddOns = addOns,
                Notify = true,
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.AnnouncementId;
    }

    private static async Task WithdrawAsync(
        SeededContext ctx,
        int announcementId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var withdrawn = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );
        Assert.Equal(HttpStatusCode.NoContent, withdrawn.StatusCode);
    }

    private static PostCalendarEntryAddOnDataDto CakePoll(DateTimeOffset? votesUntil = null) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.Poll,
            Poll = new()
            {
                PollId = null,
                Question = CakeQuestion,
                AllowsMultipleChoices = false,
                IsAnonymous = false,
                VotesUntil = votesUntil,
                Options =
                [
                    new() { OptionId = null, Label = "Ich" },
                    new() { OptionId = null, Label = "Nicht ich" },
                ],
            },
            SignUpList = null,
            DaySchedule = null,
        };

    private static PutCalendarEntryAddOnDataDto PutCakePoll(
        int pollId,
        params (int? OptionId, string Label)[] options
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.Poll,
            Poll = new()
            {
                PollId = pollId,
                Question = CakeQuestion,
                AllowsMultipleChoices = false,
                IsAnonymous = false,
                VotesUntil = null,
                Options =
                [
                    .. options.Select(option => new PutCalendarEntryPollOptionDataDto
                    {
                        OptionId = option.OptionId,
                        Label = option.Label,
                    }),
                ],
            },
            SignUpList = null,
            DaySchedule = null,
        };

    private static string EntryLink(int entryId) =>
        $"{ApiTestFixture.ClubAppBaseUrl}/calendar/{entryId}";

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
