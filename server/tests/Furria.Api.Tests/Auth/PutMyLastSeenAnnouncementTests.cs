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
    public async Task Should_StampTheMark_When_TheMemberHasReadTheAnnouncement()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var (marked, _) = await client.PUTAsync<PutMyLastSeenAnnouncement, EmptyResponse>();

                var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

                Assert.Equal(HttpStatusCode.NoContent, marked.StatusCode);
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(InsideTheSession, result.LastSeenAnnouncementAt);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .PUTAsync<PutMyLastSeenAnnouncement, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
