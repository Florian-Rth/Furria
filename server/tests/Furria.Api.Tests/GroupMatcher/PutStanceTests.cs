using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PutStanceTests : IClassFixture<ApiTestFixture>
{
    private const int VeryImportant = 3;
    private const int Minor = 1;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutStanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampTheGroupAsTakingPart_When_ItAnswersTheLastOpenStatement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                            .AddStance("tanzgarde", "konfetti", StancePosition.Yes)
                    ),
            ct
        );

        var response = await PutAsync(ctx, "bierbank", StancePosition.No, VeryImportant, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("bierbank")
            )
            .ToBe(StancePosition.No, VeryImportant)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveJoinedTheGroupMatcherAt(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NotStampTheGroup_When_ApprovedStatementsAreStillOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                    ),
            ct
        );

        var response = await PutAsync(ctx, "konfetti", StancePosition.Yes, Minor, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveJoinedTheGroupMatcherAt(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheFirstStamp_When_AStanceIsChangedLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-5);
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.")
                            .AddStance("tanzgarde", "konfetti", StancePosition.Yes)
                            .AddTakingPart("tanzgarde", joinedAt)
                    ),
            ct
        );

        var response = await PutAsync(ctx, "konfetti", StancePosition.No, Minor, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveJoinedTheGroupMatcherAt(joinedAt)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TouchTheStanceAgain_When_TheStatementWasRewordedSinceItWasTaken()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("konfetti", "Konfetti ist Pflicht.", rewordedAt: now)
                            .AddStance(
                                "tanzgarde",
                                "konfetti",
                                StancePosition.Yes,
                                VeryImportant,
                                now.AddDays(-1)
                            )
                    ),
            ct
        );

        var response = await PutAsync(ctx, "konfetti", StancePosition.Yes, VeryImportant, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("konfetti")
            )
            .ToBeTakenAt(now)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheStatementIsOnlyProposed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithAdminAnna(builder)
                    .GroupMatcher(matcher =>
                        matcher.AddProposal("vorschlag", "Wir tanzen auch rückwärts.", "tanzgarde")
                    ),
            ct
        );

        var response = await PutAsync(ctx, "vorschlag", StancePosition.Yes, Minor, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("vorschlag")
            )
            .ToNotExist()
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
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher.AddStatement("konfetti", "Konfetti ist Pflicht.")
                    ),
            ct
        );

        var response = await PutAsync(ctx, "konfetti", StancePosition.Yes, Minor, ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerForbidden_When_TheCallerAdministersAnotherGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin("anna-elferrat", "elferrat", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher.AddStatement("konfetti", "Konfetti ist Pflicht.")
                    ),
            ct
        );

        var response = await PutAsync(ctx, "konfetti", StancePosition.Yes, Minor, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Stance(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.GroupMatcher.Statements.IdOf("konfetti")
            )
            .ToNotExist()
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

    private static async Task<HttpResponseMessage> PutAsync(
        SeededContext ctx,
        string statementAlias,
        StancePosition position,
        int importance,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        return await client.PUTAsync<PutStance, PutStanceRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                StatementId = ctx.GroupMatcher.Statements.IdOf(statementAlias),
                Position = position,
                Importance = importance,
            }
        );
    }
}
