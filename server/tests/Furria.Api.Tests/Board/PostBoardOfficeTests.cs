using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class PostBoardOfficeTests
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Diese Vorstandsfunktion gibt es schon.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostBoardOfficeResponse>> CreateOfficeAsync(
        HttpClient client,
        string name,
        int sortOrder
    ) =>
        client.POSTAsync<PostBoardOffice, PostBoardOfficeRequest, PostBoardOfficeResponse>(
            new PostBoardOfficeRequest { Name = name, SortOrder = sortOrder }
        );

    [Fact]
    public async Task Should_RecordTheOffice_When_AManagerAddsItToTheBand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await CreateOfficeAsync(client, "Präsident", 1);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BoardOffice(result.BoardOfficeId)
            .ToHaveName("Präsident")
            .BoardOffice(result.BoardOfficeId)
            .ToHaveSortOrder(1)
            .BoardOffice(result.BoardOfficeId)
            .ToImplyNoRole()
            .BoardOffice(result.BoardOfficeId)
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheNameIsAlreadyInTheBand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateOfficeAsync(client, "präsident", 2);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheNameBelongsToAnArchivedOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateOfficeAsync(client, "Pressewart", 5);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateOfficeAsync(client, "", 1);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePlaceInTheBandIsNotPositive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateOfficeAsync(client, "Präsident", 0);

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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, _) = await CreateOfficeAsync(client, "Präsident", 1);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await CreateOfficeAsync(_fixture.CreateClient(), "Präsident", 1);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
