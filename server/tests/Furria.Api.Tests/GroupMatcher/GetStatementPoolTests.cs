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

public sealed class GetStatementPoolTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetStatementPoolTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListThePoolInOrderAndOnlyWaitingProposals_When_TheManagerReadsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithManagerKlara(builder)
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                            .AddProposal("rueckwaerts", "Wir tanzen rückwärts.", "tanzgarde")
                            .AddProposal(
                                "tisch",
                                "Wir tanzen auf dem Tisch.",
                                "tanzgarde",
                                MatcherStatementStatus.Rejected
                            )
                    ),
            ct
        );

        var pool = await GetAsync(ctx, ct);

        Assert.Equal(
            ["Konfetti ist Pflicht.", "Bierbänke stelle ich auf."],
            pool.Statements.Select(statement => statement.Text)
        );
        var proposal = Assert.Single(pool.Proposals);
        Assert.Equal(ctx.GroupMatcher.Statements.IdOf("rueckwaerts"), proposal.StatementId);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), proposal.ProposedBy?.GroupId);
    }

    [Fact]
    public async Task Should_ShowWhatEachActiveGroupStillOwes_When_TheCoverageIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithManagerKlara(builder)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2021)
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStatement(
                                "bierbank",
                                "Bierbänke stelle ich auf.",
                                rewordedAt: now.AddDays(-1)
                            )
                            .AddStance("tanzgarde", "konfetti", StancePosition.Yes)
                            .AddStance("tanzgarde", "bierbank", StancePosition.No)
                            .AddTakingPart("tanzgarde")
                            .AddStance("altgarde", "konfetti", StancePosition.Yes)
                    ),
            ct
        );

        var pool = await GetAsync(ctx, ct);

        Assert.Equal(
            ["Elferrat", "Tanzgarde"],
            pool.Coverage.Select(coverage => coverage.Group.Name)
        );
        var elferrat = pool.Coverage[0];
        var tanzgarde = pool.Coverage[1];
        Assert.False(elferrat.IsTakingPart);
        Assert.Equal(
            [GroupStatementState.Open, GroupStatementState.Open],
            elferrat.Cells.Select(cell => cell.State)
        );
        Assert.True(tanzgarde.IsTakingPart);
        Assert.Equal(
            [GroupStatementState.Answered, GroupStatementState.Changed],
            tanzgarde.Cells.Select(cell => cell.State)
        );
    }

    private static SeedContextBuilder WithManagerKlara(SeedContextBuilder builder) =>
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
            );

    private static async Task<GetStatementPoolResponse> GetAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        var (response, pool) = await client.GETAsync<GetStatementPool, GetStatementPoolResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return pool;
    }
}
