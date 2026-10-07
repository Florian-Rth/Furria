using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class PutBoardOfficePublicationTests
{
    private const int UnknownBoardOfficeId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutBoardOfficePublicationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> PublishAsync(
        HttpClient client,
        int boardOfficeId,
        bool isPublic
    ) =>
        client.PUTAsync<PutBoardOfficePublication, PutBoardOfficePublicationRequest>(
            new PutBoardOfficePublicationRequest
            {
                BoardOfficeId = boardOfficeId,
                IsPublic = isPublic,
            }
        );

    [Fact]
    public async Task Should_MakeTheOfficePublic_When_TheCallerHoldsBoardManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PublishAsync(client, ctx.Club.BoardOffices.IdOf("praesident"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToBePublic(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TakeTheOfficeOffTheWebsite_When_ItShouldNoLongerBePublic()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PublishAsync(client, ctx.Club.BoardOffices.IdOf("praesident"), false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToBePublic(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheOfficeIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PublishAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"), true);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBePublic(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOfficeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PublishAsync(client, UnknownBoardOfficeId, true);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PublishAsync(client, 0, true);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldBoardManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("katrin"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "rechte",
                            "katrin-rechte",
                            "Rechte",
                            "katrin",
                            FurriaPermissions.RolesManage
                        )
                    )
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await PublishAsync(client, ctx.Club.BoardOffices.IdOf("praesident"), true);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToBePublic(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var response = await PublishAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("praesident"),
            true
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
