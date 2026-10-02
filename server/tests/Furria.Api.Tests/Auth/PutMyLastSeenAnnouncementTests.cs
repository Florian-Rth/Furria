using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class PutMyLastSeenAnnouncementTests
{
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
    public async Task Should_LeaveTheMarkUnset_When_TheMemberHasNeverReadTheAnnouncement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.LastSeenAnnouncementAt);
    }

    [Fact]
    public async Task Should_StoreSeenUpTo_When_ItLiesBeforeNow()
    {
        var ct = TestContext.Current.CancellationToken;
        var newestShown = InsideTheSession.AddHours(-2);

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await MarkSeenAsync(client, newestShown);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveSeenAnnouncementsUpTo(newestShown)
                    .AssertAsync(ct);
            }
        );
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
    public async Task Should_StoreNow_When_NoSeenUpToIsSent()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await MarkSeenAsync(client, seenUpTo: null);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveSeenAnnouncementsUpTo(InsideTheSession)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_StoreNow_When_TheRequestCarriesNoBody()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await MarkSeenWithoutBodyAsync(client);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveSeenAnnouncementsUpTo(InsideTheSession)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_SeenUpToIsNotAfterTheEpoch()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await MarkSeenAsync(client, DateTimeOffset.UnixEpoch);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveSeenAnnouncementsUpTo(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await MarkSeenAsync(_fixture.CreateClient(), InsideTheSession);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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

    private static async Task<HttpResponseMessage> MarkSeenWithoutBodyAsync(HttpClient client)
    {
        var (response, _) = await client.PUTAsync<EmptyRequest, EmptyResponse>(
            client.GetTestUrlFor<PutMyLastSeenAnnouncement>(new PutMyLastSeenAnnouncementRequest()),
            EmptyRequest.Instance
        );

        return response;
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
