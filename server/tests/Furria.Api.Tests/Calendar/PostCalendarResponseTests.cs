using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

[Collection("Api")]
public sealed class PostCalendarResponseTests
{
    private const int NoSuchEntryOffset = 10_000;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheSitzung = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheUmzug = new(2027, 1, 22, 11, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheGardeTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtLastYearsBall = new(
        2026,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostCalendarResponseTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordTheZusage_When_TheEintragAsksForOne()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("vereinssitzung"),
                    AttendanceAnswer.Yes
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

                await ctx
                    .Expected.AttendanceResponsesFor(
                        ctx.Club.CalendarEntries.IdOf("vereinssitzung")
                    )
                    .ToCarryAnswerFrom(ctx.Identity.People.IdOf("alice"), AttendanceAnswer.Yes)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReplaceTheAnswer_When_SheAnswersAgain()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);
                var sitzungId = ctx.Club.CalendarEntries.IdOf("vereinssitzung");

                await AnswerAsync(client, sitzungId, AttendanceAnswer.Yes);
                var response = await AnswerAsync(client, sitzungId, AttendanceAnswer.No);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

                await ctx
                    .Expected.AttendanceResponsesFor(sitzungId)
                    .ToCarryExactlyOneAnswerFrom(ctx.Identity.People.IdOf("alice"))
                    .AttendanceResponsesFor(sitzungId)
                    .ToCarryAnswerFrom(ctx.Identity.People.IdOf("alice"), AttendanceAnswer.No)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_TakeTheAnswer_When_TheEintragIsAlreadyPast()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("letzter-ball"),
                    AttendanceAnswer.No
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

                await ctx
                    .Expected.AttendanceResponsesFor(ctx.Club.CalendarEntries.IdOf("letzter-ball"))
                    .ToCarryAnswerFrom(ctx.Identity.People.IdOf("alice"), AttendanceAnswer.No)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_RejectTheAnswer_When_TheEintragDoesNotAskForOne()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("umzug"),
                    AttendanceAnswer.Maybe
                );

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

                await ctx
                    .Expected.AttendanceResponsesFor(ctx.Club.CalendarEntries.IdOf("umzug"))
                    .ToCarryNoAnswerFrom(ctx.Identity.People.IdOf("alice"))
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEintragIsInvisibleToTheCaller()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("garde-training"),
                    AttendanceAnswer.Yes
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_TakeTheAnswer_When_TheCallerBelongsToTheOwningGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("bea", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("garde-training"),
                    AttendanceAnswer.Maybe
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

                await ctx
                    .Expected.AttendanceResponsesFor(
                        ctx.Club.CalendarEntries.IdOf("garde-training")
                    )
                    .ToCarryAnswerFrom(ctx.Identity.People.IdOf("bea"), AttendanceAnswer.Maybe)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEintragDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("vereinssitzung") + NoSuchEntryOffset,
                    AttendanceAnswer.Yes
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("gast", ct);

                var response = await AnswerAsync(
                    client,
                    ctx.Club.CalendarEntries.IdOf("vereinssitzung"),
                    AttendanceAnswer.Yes
                );

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var response = await AnswerAsync(
                    _fixture.CreateClient(),
                    ctx.Club.CalendarEntries.IdOf("vereinssitzung"),
                    AttendanceAnswer.Yes
                );

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        );
    }

    private static Task<HttpResponseMessage> AnswerAsync(
        HttpClient client,
        int calendarEntryId,
        AttendanceAnswer answer
    ) =>
        client.POSTAsync<PostCalendarResponse, PostCalendarResponseRequest>(
            new PostCalendarResponseRequest { CalendarEntryId = calendarEntryId, Answer = answer }
        );

    private Task<SeededContext> BuildKalenderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Garde")
                            .AddAccount("bea")
                            .AddMembership("bea-first", "bea", JoinedIn2017)
                            .AddAccount("gast")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "vereinssitzung",
                                "Vereinssitzung",
                                AtTheSitzung,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "umzug",
                                "Rosenmontagsumzug",
                                AtTheUmzug,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                            .AddCalendarEntry(
                                "garde-training",
                                "Training der Tanzgarde",
                                AtTheGardeTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "tanzgarde",
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "letzter-ball",
                                "Winterball",
                                AtLastYearsBall,
                                kind: CalendarEntryKind.Party,
                                asksForResponse: true
                            )
                    ),
            ct
        );
}
