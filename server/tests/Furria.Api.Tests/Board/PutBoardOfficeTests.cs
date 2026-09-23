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
public sealed class PutBoardOfficeTests
{
    private const string ConflictField = "conflict";
    private const string ArchivedOfficeMessage =
        "Eine archivierte Vorstandsfunktion kann nicht bearbeitet werden.";
    private const int UnknownBoardOfficeId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RenameOfficeAsync(
        HttpClient client,
        int boardOfficeId,
        string name,
        int sortOrder
    ) =>
        client.PUTAsync<PutBoardOffice, PutBoardOfficeRequest>(
            new PutBoardOfficeRequest
            {
                BoardOfficeId = boardOfficeId,
                Name = name,
                SortOrder = sortOrder,
            }
        );

    [Fact]
    public async Task Should_RenameTheOffice_When_AManagerCorrectsTheWording()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            "Präsidentin",
            1
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToHaveName("Präsidentin")
            .BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToHaveSortOrder(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheOffice_When_TheBandOrderChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("kassenwart"),
            "Kassenwart",
            5
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("kassenwart"))
            .ToHaveSortOrder(5)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheSeat_When_TheOfficeIsRenamedUnderItsHolder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            "Präsidentin",
            1
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToFillOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherOfficeCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("kassenwart"),
            "Präsident",
            2
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("kassenwart"))
            .ToHaveName("Kassenwart")
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("pressewart"),
            "Pressewartin",
            4
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedOfficeMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToHaveName("Pressewart")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOfficeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(client, UnknownBoardOfficeId, "Präsidentin", 1);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameOfficeAsync(client, 0, "Präsidentin", 1);

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
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            "Präsidentin",
            1
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToHaveName("Präsident")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var response = await RenameOfficeAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("praesident"),
            "Präsidentin",
            1
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> BuildWithBandAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("praesident", "Präsident", 1)
                        .AddBoardOffice("kassenwart", "Kassenwart", 2)
                ),
            ct
        );

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
