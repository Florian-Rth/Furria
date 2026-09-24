using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Api.Tests.Authorization;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class RestoreBoardOfficeTests
{
    private const string ConflictField = "conflict";
    private const string NotArchivedMessage = "Diese Vorstandsfunktion ist nicht archiviert.";
    private const int UnknownBoardOfficeId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly Elected2026 = new(2026, 1, 15);

    private readonly ApiTestFixture _fixture;

    public RestoreBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RestoreOfficeAsync(
        HttpClient client,
        int boardOfficeId
    ) =>
        client.POSTAsync<RestoreBoardOffice, RestoreBoardOfficeRequest>(
            new RestoreBoardOfficeRequest { BoardOfficeId = boardOfficeId }
        );

    [Fact]
    public async Task Should_LetTheOfficeBackIntoTheBand_When_TheBoardRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("beisitzer", "Beisitzer", 3, null, ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreOfficeAsync(client, ctx.Club.BoardOffices.IdOf("beisitzer"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("beisitzer"))
            .ToBeOpen()
            .BoardOffice(ctx.Club.BoardOffices.IdOf("beisitzer"))
            .ToHaveName("Beisitzer")
            .BoardOffice(ctx.Club.BoardOffices.IdOf("beisitzer"))
            .ToHaveSortOrder(3)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepEverySeat_When_TheOfficeIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                            .AddBoardSeat(
                                "ilka-pressewart",
                                "pressewart",
                                "ilka",
                                Elected2016,
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardSeatsOfOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToHaveCount(1)
            .BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-pressewart"))
            .ToHavePeriod(Elected2016, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HandTheImpliedPermissionsBack_When_TheOfficeIsFilledAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Roles(roles =>
                        roles.AddRole(
                            "personenpflege",
                            "Personenpflege",
                            FurriaPermissions.PersonsManage
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice(
                            "praesident",
                            "Präsident",
                            1,
                            "personenpflege",
                            ArchivedIn2021
                        )
                    ),
            ct
        );

        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreOfficeAsync(admin, ctx.Club.BoardOffices.IdOf("praesident"));
        var (seated, _) = await admin.POSTAsync<
            PostBoardSeat,
            PostBoardSeatRequest,
            PostBoardSeatResponse
        >(
            new PostBoardSeatRequest
            {
                BoardOfficeId = ctx.Club.BoardOffices.IdOf("praesident"),
                PersonId = ctx.Identity.People.IdOf("nadine"),
                SinceOn = Elected2026,
            }
        );

        var nadine = await ctx.Identity.ClientForAsync("nadine", ct);
        var (probe, _) = await nadine.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, seated.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, probe.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyRole(ctx.Roles.Roles.IdOf("personenpflege"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheOfficeIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("kassenwart", "Kassenwart", 2)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreOfficeAsync(client, ctx.Club.BoardOffices.IdOf("kassenwart"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([NotArchivedMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("kassenwart"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOfficeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreOfficeAsync(client, UnknownBoardOfficeId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
                    .Club(club =>
                        club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await RestoreOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                ),
            ct
        );

        var response = await RestoreOfficeAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("pressewart")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
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
