using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PostStatementRejectionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostStatementRejectionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MarkTheProposalRejected_When_TheManagerRejectsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var response = await RejectAsync(ctx, "vorschlag", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToHaveStatus(MatcherStatementStatus.Rejected)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRejection_When_TheStatementIsAlreadyApproved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var response = await RejectAsync(ctx, "konfetti", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("konfetti"))
            .ToHaveStatus(MatcherStatementStatus.Approved)
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
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddProposal("vorschlag", "Wir tanzen rückwärts.", "tanzgarde")
                    ),
            ct
        );

    private static async Task<HttpResponseMessage> RejectAsync(
        SeededContext ctx,
        string statementAlias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        return await client.POSTAsync<PostStatementRejection, PostStatementRejectionRequest>(
            new() { StatementId = ctx.GroupMatcher.Statements.IdOf(statementAlias) }
        );
    }
}
