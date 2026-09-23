using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class GetBoardTests
{
    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly Elected2020 = new(2020, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetBoardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetBoardResponse>> ReadBoardAsync(HttpClient client) =>
        client.GETAsync<GetBoard, GetBoardResponse>();

    [Fact]
    public async Task Should_ReadTheOfficesInBandOrder_When_TheSortOrderDisagreesWithTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("praesident", "Präsident", 1)
                        .AddBoardOffice("kassenwart", "Kassenwart", 2)
                        .AddBoardOffice("beisitzer", "Beisitzer", 3)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Club.BoardOffices.IdOf("praesident"),
                ctx.Club.BoardOffices.IdOf("kassenwart"),
                ctx.Club.BoardOffices.IdOf("beisitzer"),
            ],
            result.Offices.Select(office => office.BoardOfficeId)
        );
    }

    [Fact]
    public async Task Should_KeepTheBandOrder_When_AnElectionReplacedTheSittingPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("bernd", "Bernd", "Abt")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1)
                            .AddBoardOffice("kassenwart", "Kassenwart", 2)
                            .AddBoardSeat(
                                "ilka-praesident",
                                "praesident",
                                "ilka",
                                Elected2016,
                                HandedOver2020
                            )
                            .AddBoardSeat("bernd-praesident", "praesident", "bernd", Elected2020)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Club.BoardOffices.IdOf("praesident"), ctx.Club.BoardOffices.IdOf("kassenwart")],
            result.Offices.Select(office => office.BoardOfficeId)
        );
        var president = OfficeOf(result, ctx.Club.BoardOffices.IdOf("praesident"));
        Assert.Equal(
            [ctx.Club.BoardSeats.IdOf("bernd-praesident")],
            president.Seats.Select(seat => seat.BoardSeatId)
        );
        Assert.Equal(
            [ctx.Club.BoardSeats.IdOf("ilka-praesident")],
            president.PastSeats.Select(seat => seat.BoardSeatId)
        );
    }

    [Fact]
    public async Task Should_ReadBothSeats_When_TwoPersonsShareOneOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("bernd", "Bernd", "Abt")
                    )
                    .Club(club =>
                        club.AddBoardOffice("beisitzer", "Beisitzer", 3)
                            .AddBoardSeat("ilka-beisitzer", "beisitzer", "ilka", Elected2016)
                            .AddBoardSeat("bernd-beisitzer", "beisitzer", "bernd", Elected2020)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var assessors = OfficeOf(result, ctx.Club.BoardOffices.IdOf("beisitzer"));
        Assert.Equal(
            [
                ctx.Club.BoardSeats.IdOf("bernd-beisitzer"),
                ctx.Club.BoardSeats.IdOf("ilka-beisitzer"),
            ],
            assessors.Seats.Select(seat => seat.BoardSeatId)
        );
    }

    [Fact]
    public async Task Should_NameTheImpliedRole_When_TheOfficeCarriesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Roles(roles => roles.AddRole("vereinsleitung", "Vereinsleitung"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, "vereinsleitung")
                            .AddBoardOffice("kassenwart", "Kassenwart", 2)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var president = OfficeOf(result, ctx.Club.BoardOffices.IdOf("praesident"));
        Assert.Equal(ctx.Roles.Roles.IdOf("vereinsleitung"), president.ImpliedRoleId);
        Assert.Equal("Vereinsleitung", president.ImpliedRoleName);
        Assert.Null(OfficeOf(result, ctx.Club.BoardOffices.IdOf("kassenwart")).ImpliedRoleName);
    }

    [Fact]
    public async Task Should_ReadTheArchivedOffice_When_ItStillCarriesItsHistory()
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
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var press = OfficeOf(result, ctx.Club.BoardOffices.IdOf("pressewart"));
        Assert.Equal(ArchivedIn2021, press.ArchivedOn);
        Assert.Empty(press.Seats);
        Assert.Single(press.PastSeats);
    }

    [Fact]
    public async Task Should_ReadAnEmptyBoard_When_TheClubNeverRecordedAnOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Offices);
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
                            "gruppenpflege",
                            "katrin-gruppenpflege",
                            "Gruppenpflege",
                            "katrin",
                            FurriaPermissions.GroupsManage
                        )
                    )
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, _) = await ReadBoardAsync(client);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await ReadBoardAsync(_fixture.CreateClient());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static BoardOfficeDto OfficeOf(GetBoardResponse response, int boardOfficeId) =>
        response.Offices.Single(office => office.BoardOfficeId == boardOfficeId);
}
