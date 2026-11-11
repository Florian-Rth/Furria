using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.Authorization;
using Furria.Application.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PostStatementTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostStatementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AppendTheStatementToThePool_When_TheManagerAddsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(statementCount: 2, ct);

        var (response, result) = await AddAsync(ctx, "  Wir tanzen rückwärts. ", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(result.StatementId)
            .ToBeInPoolAs("Wir tanzen rückwärts.", sortOrder: 3)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MarkTheStatementNewForATakingPartGroup_When_TheManagerAddsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(statementCount: 1, ct);

        var (_, result) = await AddAsync(ctx, "Wir tanzen rückwärts.", ct);

        var client = await ctx.Identity.ClientForAsync("klara", ct);
        var (_, pool) = await client.GETAsync<GetStatementPool, GetStatementPoolResponse>();
        var tanzgarde = Assert.Single(pool.Coverage);
        Assert.Equal(
            GroupStatementState.New,
            tanzgarde.Cells.Single(cell => cell.StatementId == result.StatementId).State
        );
    }

    [Fact]
    public async Task Should_RefuseTheStatement_When_ThePoolIsFull()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(statementCount: MatcherStatement.MaxInPool, ct);

        var (response, _) = await AddAsync(ctx, "Wir tanzen rückwärts.", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.MatcherStatements().ToCount(MatcherStatement.MaxInPool).AssertAsync(ct);
    }

    private Task<SeededContext> BuildAsync(int statementCount, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("klara"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "jeck-check",
                            "klara-jeck-check",
                            "Jeck-Check",
                            "klara",
                            FurriaPermissions.GroupMatcherManage
                        )
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .GroupMatcher(matcher =>
                    {
                        for (var index = 1; index <= statementCount; index++)
                            matcher
                                .AddStatement($"aussage-{index}", $"Aussage {index}.")
                                .AddStance("tanzgarde", $"aussage-{index}", StancePosition.Yes);
                        matcher.AddTakingPart("tanzgarde");
                    }),
            ct
        );

    private static async Task<TestResult<PostStatementResponse>> AddAsync(
        SeededContext ctx,
        string text,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        return await client.POSTAsync<PostStatement, PostStatementRequest, PostStatementResponse>(
            new() { Text = text }
        );
    }
}
