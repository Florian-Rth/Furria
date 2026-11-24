using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class GetGroupMatcherPageTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetGroupMatcherPageTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NotCountAsTakingPart_When_TheStampedGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                archivedOn: new DateOnly(2021, 1, 1)
                            )
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStance("tanzgarde", "konfetti", StancePosition.Yes)
                            .AddTakingPart("tanzgarde")
                    ),
            ct
        );

        var (response, result) = await GetAsync(ctx, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.IsTakingPart);
        Assert.Equal(StancePosition.Yes, Assert.Single(result.Statements).Position);
    }

    private static async Task<TestResult<GetGroupMatcherPageResponse>> GetAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        return await client.GETAsync<
            GetGroupMatcherPage,
            GetGroupMatcherPageRequest,
            GetGroupMatcherPageResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });
    }
}
