using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class DeleteStatementProposalByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteStatementProposalByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheProposal_When_ItIsStillOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher.AddProposal("vorschlag", "Wir tanzen rückwärts.", "tanzgarde")
                    ),
            ct
        );

        var response = await DeleteAsync(ctx, "vorschlag", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerConflict_When_TheProposalWasRejected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher.AddProposal(
                            "vorschlag",
                            "Wir tanzen rückwärts.",
                            "tanzgarde",
                            MatcherStatementStatus.Rejected
                        )
                    ),
            ct
        );

        var response = await DeleteAsync(ctx, "vorschlag", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToHaveStatus(MatcherStatementStatus.Rejected)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_AnotherGroupProposedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .Groups(groups => groups.AddGroup("elferrat", "Elferrat"))
                    .GroupMatcher(matcher =>
                        matcher.AddProposal("vorschlag", "Wir reden elf Minuten.", "elferrat")
                    ),
            ct
        );

        var response = await DeleteAsync(ctx, "vorschlag", ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("vorschlag"))
            .ToHaveStatus(MatcherStatementStatus.Proposed)
            .AssertAsync(ct);
    }

    private static SeedContextBuilder WithAdminAnna(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("anna"))
            .Groups(groups =>
                groups
                    .AddGroup("tanzgarde", "Tanzgarde")
                    .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
            );

    private static async Task<HttpResponseMessage> DeleteAsync(
        SeededContext ctx,
        string statementAlias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        return await client.DELETEAsync<
            DeleteStatementProposalById,
            DeleteStatementProposalByIdRequest
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                StatementId = ctx.GroupMatcher.Statements.IdOf(statementAlias),
            }
        );
    }
}
