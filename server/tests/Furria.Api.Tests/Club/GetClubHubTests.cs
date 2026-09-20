using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class GetClubHubTests
{
    private const string SeededMotto = "FURRIA — Der Mittelpunkt des Universums";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly JoinedInDecember2026 = new(2026, 12, 1);
    private static readonly DateOnly JoinedInNovember2026 = new(2026, 11, 20);
    private static readonly DateOnly LeftInNovember2026 = new(2026, 11, 30);
    private static readonly DateOnly JoinedIn2010 = new(2010, 1, 1);
    private static readonly DateOnly LeftIn2012 = new(2012, 1, 1);
    private static readonly DateOnly ArchivedIn2020 = new(2020, 1, 1);

    private static readonly DateTimeOffset InTheZwischenzeit = new(
        2026,
        7,
        1,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset InTheNextZwischenzeit = new(
        2027,
        7,
        1,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset InAnUnrecordedSession = new(
        2028,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetClubHubTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NameTheComingSession_When_AMemberOpensTheHubBetweenSessions()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheZwischenzeit,
            async () =>
            {
                var result = await ReadTheHubAsMemberAsync(ct);

                Assert.Equal(2026, result.Session.StartYear);
                Assert.Equal("2026/27", result.Session.Label);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheRecordedMotto_When_TheClubHasWrittenTheSessionDown()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var result = await ReadTheHubAsMemberAsync(ct);

                Assert.Equal(2026, result.Session.StartYear);
                Assert.Equal(SeededMotto, result.Session.Motto);
                Assert.Null(result.Session.Number);
                Assert.Null(result.Session.SignetSvg);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheSessionAnyway_When_TheClubHasNoRecordOfIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InAnUnrecordedSession,
            async () =>
            {
                var result = await ReadTheHubAsMemberAsync(ct);

                Assert.Equal(2027, result.Session.StartYear);
                Assert.Equal("2027/28", result.Session.Label);
                Assert.Null(result.Session.Motto);
                Assert.Null(result.Session.Number);
                Assert.Null(result.Session.SignetSvg);
            }
        );
    }

    [Fact]
    public async Task Should_CarryEverySectionEmpty_When_NothingButTheSessionIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var result = await ReadTheHubAsMemberAsync(ct);

                Assert.Empty(result.Announcements.Newest);
                Assert.Equal(0, result.Announcements.TotalCount);
                Assert.Empty(result.Calendar);
                Assert.Empty(result.Board);
                Assert.Empty(result.Venues);
            }
        );
    }

    [Fact]
    public async Task Should_CountPeopleRatherThanMitgliedschaften_When_TheStripIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var result = await ReadTheHubAsWholeClubAsync(ct);

                Assert.Equal(2, result.Stats.MemberCount);
                Assert.Equal(1, result.Stats.JoinedThisSessionCount);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutArchivedGruppen_When_TheStripIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var result = await ReadTheHubAsWholeClubAsync(ct);

                Assert.Equal(1, result.Stats.GroupCount);
            }
        );
    }

    [Fact]
    public async Task Should_CountAMemberWhoJoinedAfterTheLastOpening_When_TheHubIsReadBetweenSessions()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheNextZwischenzeit,
            async () =>
            {
                var result = await ReadTheHubAsWholeClubAsync(ct);

                Assert.Equal(2027, result.Session.StartYear);
                Assert.Equal(1, result.Stats.JoinedThisSessionCount);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, _) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<GetClubHubResponse> ReadTheHubAsMemberAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        return await ReadAsync(ctx, ct);
    }

    private async Task<GetClubHubResponse> ReadTheHubAsWholeClubAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-earlier", "alice", JoinedIn2010, LeftIn2012)
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Neuling")
                            .AddMembership(
                                "bea-first",
                                "bea",
                                JoinedInNovember2026,
                                LeftInNovember2026
                            )
                            .AddMembership("bea-second", "bea", JoinedInDecember2026)
                            .AddPerson("chris", "Chris", "Ehemals")
                            .AddMembership("chris-first", "chris", JoinedIn2010, LeftIn2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2020)
                    ),
            ct
        );

        return await ReadAsync(ctx, ct);
    }

    private static async Task<GetClubHubResponse> ReadAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
