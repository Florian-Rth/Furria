using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetGroupKindsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupKindsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OmitTheGroupKind_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("garde", "Garde")
                            .AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var garde = Assert.Single(result.Kinds);
        Assert.Equal(ctx.Groups.GroupKinds.IdOf("garde"), garde.GroupKindId);
    }
}
