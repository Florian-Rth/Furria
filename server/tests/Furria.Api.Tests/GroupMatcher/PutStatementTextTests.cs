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

public sealed class PutStatementTextTests : IClassFixture<ApiTestFixture>
{
    private const string Original = "Konfetti ist Pflicht.";
    private const int VeryImportant = 3;

    private readonly ApiTestFixture _fixture;

    public PutStatementTextTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheStancesAndMarkThemChanged_When_AStatementIsReworded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("klara", ct);

        var response = await RewordAsync(client, ctx, "konfetti", "Konfetti gehört dazu.");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, pool) = await client.GETAsync<GetStatementPool, GetStatementPoolResponse>();
        Assert.Equal("Konfetti gehört dazu.", Assert.Single(pool.Statements).Text);
        Assert.Equal(
            GroupStatementState.Changed,
            Assert.Single(Assert.Single(pool.Coverage).Cells).State
        );
        await ctx
            .Expected.Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("konfetti")
            )
            .ToBe(StancePosition.Yes, VeryImportant)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheStancesCurrent_When_TheTextIsUnchanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("klara", ct);

        var response = await RewordAsync(client, ctx, "konfetti", $" {Original} ");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MatcherStatement(ctx.GroupMatcher.Statements.IdOf("konfetti"))
            .ToBeRewordedAt(null)
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
                            .AddStatement("konfetti", Original)
                            .AddStance("tanzgarde", "konfetti", StancePosition.Yes, VeryImportant)
                    ),
            ct
        );

    private static Task<HttpResponseMessage> RewordAsync(
        HttpClient client,
        SeededContext ctx,
        string statementAlias,
        string text
    ) =>
        client.PUTAsync<PutStatementText, PutStatementTextRequest>(
            new() { StatementId = ctx.GroupMatcher.Statements.IdOf(statementAlias), Text = text }
        );
}
