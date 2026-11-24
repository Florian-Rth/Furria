using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PutMyLastSeenAnnouncementTests : IClassFixture<ApiTestFixture>
{
    private const int OverlapRounds = 10;
    private const int OverlappingStaleMarks = 20;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutMyLastSeenAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CapAtNow_When_SeenUpToLiesInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await MarkSeenAsync(client, InsideTheSession.AddDays(1));

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveSeenAnnouncementsUpTo(InsideTheSession)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheLaterMoment_When_SeenUpToLiesBeforeTheStoredOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var seenOnTheBoard = InsideTheSession.AddHours(-1);

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);
                await MarkSeenAsync(client, seenOnTheBoard);

                var response = await MarkSeenAsync(client, InsideTheSession.AddHours(-3));

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveSeenAnnouncementsUpTo(seenOnTheBoard)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheLatestMark_When_PutsOverlap()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);
                var account = ctx.Expected.Account(ctx.Identity.Accounts.IdOf("alice"));

                foreach (var round in Enumerable.Range(1, OverlapRounds))
                {
                    var latest = await MarkSeenOverlappingAsync(client, round);

                    await account.ToHaveSeenAnnouncementsUpTo(latest).AssertAsync(ct);
                }
            }
        );
    }

    private static async Task<HttpResponseMessage> MarkSeenAsync(
        HttpClient client,
        DateTimeOffset? seenUpTo
    )
    {
        var (response, _) = await client.PUTAsync<
            PutMyLastSeenAnnouncement,
            PutMyLastSeenAnnouncementRequest,
            EmptyResponse
        >(new PutMyLastSeenAnnouncementRequest { SeenUpTo = seenUpTo });

        return response;
    }

    private static async Task<DateTimeOffset> MarkSeenOverlappingAsync(HttpClient client, int round)
    {
        var roundStart = InsideTheSession.AddHours(round - OverlapRounds - 1);
        var latest = roundStart.AddMinutes(OverlappingStaleMarks + 1);
        var staleMarks = Enumerable
            .Range(1, OverlappingStaleMarks)
            .Select(minute => roundStart.AddMinutes(minute));

        var responses = await Task.WhenAll(
            staleMarks.Prepend(latest).Select(seenUpTo => MarkSeenAsync(client, seenUpTo))
        );

        Assert.All(
            responses,
            response => Assert.Equal(HttpStatusCode.NoContent, response.StatusCode)
        );
        return latest;
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );
}
