using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WhatsApp;
using Xunit;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppAnswersTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChatId = "120363000000000001@g.us";
    private const string AlicesChatId = "491701234567@c.us";
    private const string StrangersChatId = "491609999999@c.us";
    private const string CarlasChatId = "491705555555@c.us";
    private const string Question = "Welche Uhrzeit?";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private readonly ApiTestFixture _fixture;

    public WhatsAppAnswersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset Now => _fixture.TimeProvider.GetUtcNow();

    [Fact]
    public async Task Should_CountHerVote_When_HerPhoneMatchesTheVoter()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await PostAnnouncementAsync(ctx, AnnouncementPoll(), ct);
        var poll = await PostedAsync("sendPoll", ct);

        await DeliverAnswersAsync(ct, PollVote(poll.MessageId, AlicesChatId, Now, "14 Uhr"));

        var answered = (await AnnouncementSeenByAsync(ctx, "alice", ct)).AddOns.Single().Poll;
        Assert.NotNull(answered);
        var chosen = Assert.Single(answered.Options, option => option.ViewerChose);
        Assert.Equal("14 Uhr", chosen.Label);
        var voter = Assert.Single(chosen.Voters);
        Assert.Equal(
            (ctx.Identity.People.IdOf("alice"), true),
            (voter.PersonId, voter.IsGivenThroughWhatsApp)
        );
    }

    [Fact]
    public async Task Should_ShowTheUnassignedAnswerToTheOrganiserOnly_When_NoPersonCarriesTheNumber()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        _fixture.Waha.KnowContact(StrangersChatId, "Onkel Heinz");
        await PostAnnouncementAsync(ctx, AnnouncementAttendance(), ct);
        var poll = await PostedAsync("sendPoll", ct);

        await DeliverAnswersAsync(ct, PollVote(poll.MessageId, StrangersChatId, Now, "Ja"));

        var organisers = (await AnnouncementSeenByAsync(ctx, "bea", ct)).AddOns.Single();
        var unassigned = Assert.Single(organisers.Attendance?.Unassigned ?? []);
        Assert.Equal(
            ("Onkel Heinz", "+491609999999", AttendanceAnswer.Yes),
            (unassigned.WhatsAppName, unassigned.Phone, unassigned.Answer)
        );
        Assert.Empty(organisers.Attendance?.Answers ?? []);
        var readers = (await AnnouncementSeenByAsync(ctx, "alice", ct)).AddOns.Single();
        Assert.Null(readers.Attendance?.Unassigned);
    }

    [Fact]
    public async Task Should_KeepTheLaterVote_When_AnEarlierOneArrivesAfterIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await PostAnnouncementAsync(ctx, AnnouncementAttendance(), ct);
        var poll = await PostedAsync("sendPoll", ct);

        await DeliverAnswersAsync(
            ct,
            PollVote(poll.MessageId, AlicesChatId, Now.AddSeconds(-1), "Nein"),
            PollVote(poll.MessageId, AlicesChatId, Now.AddSeconds(-2), "Ja")
        );

        var seen = await AnnouncementSeenByAsync(ctx, "alice", ct);
        Assert.Equal(AttendanceAnswer.No, seen.ViewerAnswer);
    }

    [Fact]
    public async Task Should_KeepHerAppAnswer_When_HerWhatsAppVoteIsOlder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var announcementId = await PostAnnouncementAsync(ctx, AnnouncementAttendance(), ct);
        var poll = await PostedAsync("sendPoll", ct);
        await AnswerInTheAppAsync(ctx, announcementId, AttendanceAnswer.Yes, ct);

        await DeliverAnswersAsync(
            ct,
            PollVote(poll.MessageId, AlicesChatId, Now.AddMinutes(-1), "Nein")
        );

        var seen = await AnnouncementSeenByAsync(ctx, "bea", ct);
        var answer = Assert.Single(seen.AddOns.Single().Attendance?.Answers ?? []);
        Assert.Equal((AttendanceAnswer.Yes, false), (answer.Answer, answer.IsGivenThroughWhatsApp));
    }

    [Fact]
    public async Task Should_TellTheVoterPrivatelyOnce_When_SheVotesAfterTheAddOnClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var announcementId = await PostAnnouncementAsync(ctx, AnnouncementAttendance(), ct);
        var poll = await PostedAsync("sendPoll", ct);
        await CloseAttendanceAsync(ctx, announcementId, ct);

        await DeliverAnswersAsync(
            ct,
            PollVote(poll.MessageId, AlicesChatId, Now.AddMinutes(1), "Ja"),
            PollVote(poll.MessageId, AlicesChatId, Now.AddMinutes(2), "Nein")
        );
        await _fixture.WhatsAppOutboxDrainedAsync(ct);

        var told = Assert.Single(_fixture.Waha.Sent, sent => sent.ChatId == AlicesChatId);
        Assert.Equal("sendText", told.Kind);
        Assert.Contains("Saalreinigung", told.Text);
        Assert.Contains($"/announcements/{announcementId}", told.Text);
    }

    [Fact]
    public async Task Should_CountNothing_When_TheMatchedPersonMayNotAnswer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await PostAnnouncementAsync(ctx, AnnouncementAttendance(), ct);
        var poll = await PostedAsync("sendPoll", ct);

        await DeliverAnswersAsync(ct, PollVote(poll.MessageId, CarlasChatId, Now, "Ja"));

        var attendance = (await AnnouncementSeenByAsync(ctx, "bea", ct)).AddOns.Single().Attendance;
        Assert.NotNull(attendance);
        Assert.Empty(attendance.Answers);
        Assert.Empty(attendance.Unassigned ?? []);
    }

    private async Task DeliverAnswersAsync(CancellationToken ct, params string[] bodies)
    {
        var client = _fixture.CreateClient();
        foreach (var body in bodies)
        {
            var answer = await DeliverAsync(client, body, $"answer-{Guid.NewGuid():N}", ct);
            Assert.Equal(HttpStatusCode.OK, answer.StatusCode);
            await _fixture.WhatsAppInboxDrainedAsync(ct);
        }
    }

    private async Task<FakeWahaSend> PostedAsync(string kind, CancellationToken ct)
    {
        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        return Assert.Single(_fixture.Waha.Sent, sent => sent.Kind == kind);
    }

    private static async Task<AnnouncementDto> AnnouncementSeenByAsync(
        SeededContext ctx,
        string login,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(login, ct);
        var (response, result) = await client.GETAsync<
            GetAnnouncements,
            GetAnnouncementsResponse
        >();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return Assert.Single(result.Announcements);
    }

    private static async Task AnswerInTheAppAsync(
        SeededContext ctx,
        int announcementId,
        AttendanceAnswer answer,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var response = await client.POSTAsync<
            PostAnnouncementAnswer,
            PostAnnouncementAnswerRequest
        >(new PostAnnouncementAnswerRequest { AnnouncementId = announcementId, Answer = answer });
        Assert.True(response.IsSuccessStatusCode);
    }

    private static async Task CloseAttendanceAsync(
        SeededContext ctx,
        int announcementId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var response = await client.POSTAsync<
            CloseAnnouncementAttendance,
            CloseAnnouncementAttendanceRequest
        >(new CloseAnnouncementAttendanceRequest { AnnouncementId = announcementId });
        Assert.True(response.IsSuccessStatusCode);
    }

    private static async Task<int> PostAnnouncementAsync(
        SeededContext ctx,
        PostAnnouncementAddOnDataDto addOn,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new PostAnnouncementRequest
            {
                Title = "Saalreinigung",
                Body = "Wer hilft?",
                ValidUntil = null,
                AddOns = [addOn],
                Notify = true,
            }
        );
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

    private static PostAnnouncementAddOnDataDto AnnouncementPoll() =>
        new()
        {
            Kind = AnnouncementAddOnKind.Poll,
            Attendance = null,
            Poll = new()
            {
                PollId = null,
                Question = Question,
                AllowsMultipleChoices = false,
                IsAnonymous = false,
                VotesUntil = null,
                Options =
                [
                    new() { OptionId = null, Label = "10 Uhr" },
                    new() { OptionId = null, Label = "14 Uhr" },
                ],
            },
            SignUpList = null,
            Borrowed = null,
        };

    private async Task<SeededContext> BuildClubAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddPersonContact("alice", phone: "0170 1234567")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("carla", "Carla", "Ehemalig")
                            .AddPersonContact("carla", phone: "0170 5555555")
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
                    ),
            ct
        );
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        return ctx;
    }
}
