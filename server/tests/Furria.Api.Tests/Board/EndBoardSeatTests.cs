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
public sealed class EndBoardSeatTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string EndedSeatMessage = "Dieser Vorstandssitz ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Ein Vorstandssitz kann nicht vor seinem Beginn enden.";
    private const int UnknownBoardSeatId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);

    private readonly ApiTestFixture _fixture;

    public EndBoardSeatTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> EndSeatAsync(
        HttpClient client,
        int boardOfficeId,
        int boardSeatId,
        DateOnly endedOn
    ) =>
        client.POSTAsync<EndBoardSeat, EndBoardSeatRequest>(
            new EndBoardSeatRequest
            {
                BoardOfficeId = boardOfficeId,
                BoardSeatId = boardSeatId,
                EndedOn = endedOn,
            }
        );

    [Fact]
    public async Task Should_CloseThePeriod_When_AManagerEndsTheSitz()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToHavePeriod(Elected2016, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CloseThePeriod_When_TheEndIsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var handsOverTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            handsOverTomorrow
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToHavePeriod(Elected2016, handsOverTomorrow)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndOnItsOwnStart_When_TheSitzLastedOneDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToHavePeriod(Elected2016, Elected2016)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            Elected2016.AddDays(-1)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EndBeforeStartMessage], failures[ValidationField]);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheSitzIsAlreadyEnded()
    {
        var ct = TestContext.Current.CancellationToken;
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
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020.AddDays(1)
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EndedSeatMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToHavePeriod(Elected2016, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheSitzIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            UnknownBoardSeatId,
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheSitzBelongsToAnotherFunktion()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardOffice("kassenwart", "Kassenwart", 2)
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("kassenwart"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            0,
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldBoardManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("katrin")
                    )
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
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEnd_When_TheFunktionCarriesARolleTheCallerMayNotGrant()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("allmacht", "Allmacht", FurriaPermissions.RolesManage)
                            .AddRoleWithHolder(
                                "vorstandspflege",
                                "katrin-vorstandspflege",
                                "Vorstandspflege",
                                "katrin",
                                FurriaPermissions.BoardManage
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, "allmacht")
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await EndSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningSitzAsync(ct);

        var response = await EndSeatAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Club.BoardSeats.IdOf("ilka-praesident"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithRunningSitzAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardSeat("ilka-praesident", "praesident", "ilka", Elected2016)
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
