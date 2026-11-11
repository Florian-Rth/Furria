using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PostStatementApprovalTests : IClassFixture<ApiTestFixture>
{
    private const string Proposed = "Wir tanzen rückwärts.";

    private readonly ApiTestFixture _fixture;

    public PostStatementApprovalTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AppendTheProposalToThePool_When_ItIsApproved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(approvedCount: 2, MatcherStatementStatus.Proposed, ct);

        var response = await ApproveAsync(ctx, text: null, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToBeApprovedAs(Proposed, sortOrder: 3)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TakeTheNewWording_When_TheManagerRewordsWhileApproving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(approvedCount: 0, MatcherStatementStatus.Proposed, ct);

        var response = await ApproveAsync(ctx, "  Wir tanzen gern rückwärts. ", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToBeApprovedAs("Wir tanzen gern rückwärts.", sortOrder: 1)
            .MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToBeRewordedAt(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheApproval_When_TenStatementsAreApproved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            approvedCount: MatcherStatement.MaxApproved,
            MatcherStatementStatus.Proposed,
            ct
        );

        var response = await ApproveAsync(ctx, text: null, ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToHaveStatus(MatcherStatementStatus.Proposed)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheApproval_When_TheProposalWasRejected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(approvedCount: 0, MatcherStatementStatus.Rejected, ct);

        var response = await ApproveAsync(ctx, text: null, ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToHaveStatus(MatcherStatementStatus.Rejected)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildAsync(
        int approvedCount,
        MatcherStatementStatus proposalStatus,
        CancellationToken ct
    ) =>
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
                        for (var index = 1; index <= approvedCount; index++)
                            matcher.AddStatement($"aussage-{index}", $"Aussage {index}.");
                        matcher.AddProposal("vorschlag", Proposed, "tanzgarde", proposalStatus);
                    }),
            ct
        );

    private static async Task<HttpResponseMessage> ApproveAsync(
        SeededContext ctx,
        string? text,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        return await client.POSTAsync<PostStatementApproval, PostStatementApprovalRequest>(
            new() { StatementId = ctx.GroupMatcher.Statements.IdOf("vorschlag"), Text = text }
        );
    }
}
