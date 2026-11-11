using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PostStatementProposalTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostStatementProposalTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordAnOpenProposalOfTheGroup_When_TheGroupAdminProposesAStatement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostStatementProposal,
            PostStatementProposalRequest,
            PostStatementProposalResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Text = "  Ich tanze auch rückwärts.  ",
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(result.StatementId)
            .ToBeProposedBy(ctx.Groups.Groups.IdOf("tanzgarde"), "Ich tanze auch rückwärts.")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerConflict_When_TheGroupIsArchived()
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostStatementProposal,
            PostStatementProposalRequest,
            PostStatementProposalResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde"), Text = "Wir tanzen rückwärts." });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
