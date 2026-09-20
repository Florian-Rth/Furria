using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class PostBoardSeatTests
{
    private const string ConflictField = "conflict";
    private const string OpenSeatMessage = "Diese Person hat diese Vorstandsfunktion bereits inne.";
    private const string OverlappingSeatMessage =
        "Dieser Zeitraum überschneidet sich mit einem bestehenden Vorstandssitz. "
        + "Ein erneuter Vorstandssitz beginnt frühestens am Tag nach dem Ende des vorigen.";
    private const string ArchivedOfficeMessage =
        "Eine archivierte Vorstandsfunktion kann nicht bearbeitet werden.";
    private const int UnknownBoardOfficeId = 999_999;
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostBoardSeatTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostBoardSeatResponse>> OpenSeatAsync(
        HttpClient client,
        int boardOfficeId,
        int personId,
        DateOnly sinceOn
    ) =>
        client.POSTAsync<PostBoardSeat, PostBoardSeatRequest, PostBoardSeatResponse>(
            new PostBoardSeatRequest
            {
                BoardOfficeId = boardOfficeId,
                PersonId = personId,
                SinceOn = sinceOn,
            }
        );

    [Fact]
    public async Task Should_OpenTheSitz_When_AManagerRecordsTheElection()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BoardSeat(result.BoardSeatId)
            .ToFillOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .BoardSeat(result.BoardSeatId)
            .ToBeHeldBy(ctx.Identity.People.IdOf("ilka"))
            .BoardSeat(result.BoardSeatId)
            .ToHavePeriod(Elected2016, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenASecondSitz_When_TwoPersonsShareOneFunktion()
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
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("beisitzer"),
            ctx.Identity.People.IdOf("bernd"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Club.BoardSeats.IdOf("ilka-beisitzer"), result.BoardSeatId);
        await ctx
            .Expected.BoardSeat(result.BoardSeatId)
            .ToBeOpen()
            .BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-beisitzer"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheRow_When_TheSitzStartsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var takesOverTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            takesOverTomorrow
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BoardSeat(result.BoardSeatId)
            .ToHavePeriod(takesOverTomorrow, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenAnotherSitz_When_TheReelectionStartsAfterTheLastOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithHandedOverFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020.AddDays(1)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Club.BoardSeats.IdOf("ilka-praesident"), result.BoardSeatId);
        await ctx
            .Expected.BoardSeat(result.BoardSeatId)
            .ToHavePeriod(HandedOver2020.AddDays(1), null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheReelectionStartsOnTheDayTheLastOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithHandedOverFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OverlappingSeatMessage], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePersonAlreadySitsInTheFunktion()
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
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OpenSeatMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("ilka-praesident"))
            .ToHavePeriod(Elected2016, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheFunktionIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club =>
                        club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("pressewart"),
            ctx.Identity.People.IdOf("ilka"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedOfficeMessage], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheFunktionIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            UnknownBoardOfficeId,
            ctx.Identity.People.IdOf("ilka"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            UnknownPersonId,
            Elected2016
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheBodyCarriesNoUsablePersonId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            0,
            Elected2016
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
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheSitz_When_TheFunktionCarriesARolleTheCallerMayNotGrant()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPoweredFunktionAsync(ct);

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("katrin"),
            Elected2016
        );
        var (readRoles, _) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, readRoles.StatusCode);
        await ctx
            .Expected.BoardSeatsOfOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenTheSitz_When_TheCallerMayAlsoGrantTheRolleItCarries()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPoweredFunktionAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("katrin"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BoardSeat(result.BoardSeatId)
            .ToBeHeldBy(ctx.Identity.People.IdOf("katrin"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeFunktionAsync(ct);

        var (response, _) = await OpenSeatAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Identity.People.IdOf("ilka"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> BuildWithFreeFunktionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

    private Task<SeededContext> BuildWithPoweredFunktionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("katrin"))
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
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1, "allmacht")),
            ct
        );

    private Task<SeededContext> BuildWithHandedOverFunktionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
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
