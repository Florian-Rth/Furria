using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class DeleteStatementByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteStatementByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DropItsStancesAndCloseTheGap_When_AStatementIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            matcher =>
                matcher
                    .AddStatement("konfetti", "Konfetti ist Pflicht.")
                    .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                    .AddStatement("orden", "Orden sind schwer.")
                    .AddStance("tanzgarde", "bierbank", StancePosition.No),
            ct
        );

        var response = await DeleteAsync(ctx, "bierbank", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("bierbank"))
            .ToNotExist()
            .Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("bierbank")
            )
            .ToNotExist()
            .MatcherStatement(ctx.GroupMatcher.Statements.IdOf("orden"))
            .ToBeInPoolAs("Orden sind schwer.", sortOrder: 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampTheGroupAsTakingPart_When_ItsLastOpenStatementIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            matcher =>
                matcher
                    .AddStatement("konfetti", "Konfetti ist Pflicht.")
                    .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                    .AddStance("tanzgarde", "konfetti", StancePosition.Yes),
            ct
        );

        var response = await DeleteAsync(ctx, "bierbank", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveJoinedTheGroupMatcherAt(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampNoGroup_When_TheLastStatementIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            matcher => matcher.AddStatement("konfetti", "Konfetti ist Pflicht."),
            ct
        );

        var response = await DeleteAsync(ctx, "konfetti", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveJoinedTheGroupMatcherAt(null)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildAsync(
        Action<GroupMatcherSeedBuilder> arrangeMatcher,
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
                    .GroupMatcher(arrangeMatcher),
            ct
        );

    private static async Task<HttpResponseMessage> DeleteAsync(
        SeededContext ctx,
        string statementAlias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("klara", ct);
        return await client.DELETEAsync<DeleteStatementById, DeleteStatementByIdRequest>(
            new() { StatementId = ctx.GroupMatcher.Statements.IdOf(statementAlias) }
        );
    }
}
