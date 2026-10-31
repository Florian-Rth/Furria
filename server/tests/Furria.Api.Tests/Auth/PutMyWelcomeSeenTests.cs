using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PutMyWelcomeSeenTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset FirstSignIn = new(
        2026,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutMyWelcomeSeenTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportTheWelcomeUnseen_When_TheMemberHasNeverSeenIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.WelcomeSeenAt);
    }

    [Fact]
    public async Task Should_StoreNow_When_TheMemberHasSeenTheWelcome()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            FirstSignIn,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var response = await MarkSeenAsync(client);
                var (_, me) = await client.GETAsync<GetMe, GetMeResponse>();

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                Assert.Equal(FirstSignIn, me.WelcomeSeenAt);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheFirstMoment_When_TheWelcomeIsMarkedSeenAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.AtInstantAsync(
            FirstSignIn,
            async () =>
            {
                var ctx = await BuildAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);
                await MarkSeenAsync(client);

                await _fixture.AtInstantAsync(
                    FirstSignIn.AddMinutes(5),
                    async () =>
                    {
                        var response = await MarkSeenAsync(client);
                        var (_, me) = await client.GETAsync<GetMe, GetMeResponse>();

                        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                        Assert.Equal(FirstSignIn, me.WelcomeSeenAt);
                    }
                );
            }
        );
    }

    private static async Task<HttpResponseMessage> MarkSeenAsync(HttpClient client)
    {
        var (response, _) = await client.PUTAsync<EmptyRequest, EmptyResponse>(
            client.GetTestUrlFor<PutMyWelcomeSeen>(EmptyRequest.Instance),
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
