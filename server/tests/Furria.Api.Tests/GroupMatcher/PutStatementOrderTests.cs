using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PutStatementOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutStatementOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PutThePoolInTheGivenOrder_When_TheManagerReordersIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var response = await ReorderAsync(ctx, ["orden", "konfetti", "bierbank"], ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("orden"))
            .ToBeInPoolAs("Orden sind schwer.", sortOrder: 1)
            .MatcherStatement(ctx.GroupMatcher.Statements.IdOf("konfetti"))
            .ToBeInPoolAs("Konfetti ist Pflicht.", sortOrder: 2)
            .MatcherStatement(ctx.GroupMatcher.Statements.IdOf("bierbank"))
            .ToBeInPoolAs("Bierbänke stelle ich auf.", sortOrder: 3)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheOrder_When_ItMissesAPoolStatement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var response = await ReorderAsync(ctx, ["orden", "konfetti"], ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("orden"))
            .ToBeInPoolAs("Orden sind schwer.", sortOrder: 3)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
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
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                            .AddStatement("orden", "Orden sind schwer.")
                    ),
            ct
        );

    private static async Task<HttpResponseMessage> ReorderAsync(
        SeededContext ctx,
        IReadOnlyList<string> statementAliases,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        return await client.PUTAsync<PutStatementOrder, PutStatementOrderRequest>(
            new() { StatementIds = [.. statementAliases.Select(ctx.GroupMatcher.Statements.IdOf)] }
        );
    }
}
