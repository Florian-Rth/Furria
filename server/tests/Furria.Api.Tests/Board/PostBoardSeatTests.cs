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

public sealed class PostBoardSeatTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string OpenSeatMessage = "Diese Person hat diese Vorstandsfunktion bereits inne.";
    private const string OverlappingSeatMessage =
        "Dieser Zeitraum überschneidet sich mit einem bestehenden Vorstandssitz. "
        + "Ein erneuter Vorstandssitz beginnt frühestens am Tag nach dem Ende des vorigen.";
    private const string ArchivedOfficeMessage =
        "Eine archivierte Vorstandsfunktion kann nicht bearbeitet werden.";

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
    public async Task Should_LiftHerArchive_When_AnArchivedPersonTakesASeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddArchive("paula", ArchivedIn2021)
                    )
                    .Club(club => club.AddBoardOffice("kassenwart", "Kassenwart", 3)),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await OpenSeatAsync(
            client,
            ctx.Club.BoardOffices.IdOf("kassenwart"),
            ctx.Identity.People.IdOf("paula"),
            Elected2016
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheReelectionStartsOnTheDayTheLastOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithHandedOverOfficeAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_ReturnConflict_When_ThePersonAlreadySitsInTheOffice()
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_ReturnConflict_When_TheOfficeIsArchived()
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_RefuseTheSeat_When_TheOfficeCarriesARoleTheCallerMayNotGrant()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPoweredOfficeAsync(ct);

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
    public async Task Should_OpenTheSeat_When_TheCallerMayAlsoGrantTheRoleItCarries()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPoweredOfficeAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

    private Task<SeededContext> BuildWithPoweredOfficeAsync(CancellationToken ct) =>
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

    private Task<SeededContext> BuildWithHandedOverOfficeAsync(CancellationToken ct) =>
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
