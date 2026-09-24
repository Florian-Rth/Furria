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
public sealed class ArchiveBoardOfficeTests
{
    private const string ConflictField = "conflict";
    private const string OccupiedOfficeMessage =
        "Diese Vorstandsfunktion ist besetzt. Beende zuerst den Vorstandssitz.";
    private const string AlreadyArchivedMessage = "Diese Vorstandsfunktion ist bereits archiviert.";
    private const int UnknownBoardOfficeId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public ArchiveBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> ArchiveOfficeAsync(
        HttpClient client,
        int boardOfficeId
    ) =>
        client.POSTAsync<ArchiveBoardOffice, ArchiveBoardOfficeRequest>(
            new ArchiveBoardOfficeRequest { BoardOfficeId = boardOfficeId }
        );

    [Fact]
    public async Task Should_ArchiveTheOffice_When_NobodySitsInIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("pressewart", "Pressewart", 4)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(_fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ArchiveTheOffice_When_ItsOnlySeatIsAlreadyOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("pressewart", "Pressewart", 4)
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
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(_fixture.Today)
            .BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-pressewart"))
            .ToHavePeriod(Elected2016, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ARunningSeatWouldLoseItsImpliedPermissions()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles => roles.AddRole("vereinsleitung", "Vereinsleitung"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, "vereinsleitung")
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("praesident"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OccupiedOfficeMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ASeatStillEndsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var endsTomorrow = _fixture.Today.AddDays(1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardSeat(
                                "ilka-praesident",
                                "praesident",
                                "ilka",
                                Elected2016,
                                endsTomorrow
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("praesident"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheOfficeIsAlreadyArchived()
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
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([AlreadyArchivedMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOfficeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveOfficeAsync(client, UnknownBoardOfficeId);

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
                    .Club(club => club.AddBoardOffice("pressewart", "Pressewart", 4)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await ArchiveOfficeAsync(client, ctx.Club.BoardOffices.IdOf("pressewart"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddBoardOffice("pressewart", "Pressewart", 4)),
            ct
        );

        var response = await ArchiveOfficeAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("pressewart")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeOpen()
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
