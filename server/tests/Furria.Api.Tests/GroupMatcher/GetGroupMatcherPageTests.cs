using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.GroupMatcher;
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
    public async Task Should_MarkEveryStatementByWhatItNeeds_When_TheGroupTakesPart()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("beantwortet", "Konfetti ist Pflicht.", now.AddDays(-30))
                            .AddStatement(
                                "umformuliert",
                                "Bierbänke stelle ich auf.",
                                now.AddDays(-30),
                                rewordedAt: now.AddDays(-1)
                            )
                            .AddStatement("offen", "Orden sind schwer.", now.AddDays(-30))
                            .AddStatement("neu", "Wir tanzen rückwärts.", now.AddDays(-2))
                            .AddStance("tanzgarde", "beantwortet", StancePosition.Yes, 3)
                            .AddStance("tanzgarde", "umformuliert", StancePosition.No, 1)
                            .AddTakingPart("tanzgarde", now.AddDays(-10))
                    ),
            ct
        );

        var (response, result) = await GetAsync(ctx, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.IsTakingPart);
        Assert.Equal(
            [
                GroupStatementState.Answered,
                GroupStatementState.Changed,
                GroupStatementState.Open,
                GroupStatementState.New,
            ],
            result.Statements.Select(statement => statement.State)
        );
        Assert.Equal(StancePosition.Yes, result.Statements[0].Position);
        Assert.Equal(3, result.Statements[0].Importance);
        Assert.Null(result.Statements[2].Position);
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

    private static SeedContextBuilder WithAdminAnna(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("anna"))
            .Groups(groups =>
                groups
                    .AddGroup("tanzgarde", "Tanzgarde")
                    .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
            );

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
