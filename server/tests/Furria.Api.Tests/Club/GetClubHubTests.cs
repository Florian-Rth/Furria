using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetClubHubTests : IClassFixture<ApiTestFixture>
{
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
    public async Task Should_CountPeopleRatherThanMemberships_When_TheStripIsRead()
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
    public async Task Should_LeaveOutArchivedAndManagementGroups_When_TheStripIsRead()
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

    private Task<GetClubHubResponse> ReadTheHubAsMemberAsync(CancellationToken ct) =>
        ReadTheHubAsMemberAsync(_ => { }, ct);

    private async Task<GetClubHubResponse> ReadTheHubAsMemberAsync(
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    ) => await ReadAsync(await BuildMemberClubAsync(club, ct), ct);

    private Task<SeededContext> BuildMemberClubAsync(
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club),
            ct
        );

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
                            .AddGroup("vorstandsrunde", "Vorstandsrunde", isManagementGroup: true)
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
