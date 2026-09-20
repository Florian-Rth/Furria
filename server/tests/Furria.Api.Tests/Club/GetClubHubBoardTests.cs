using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class GetClubHubBoardTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly SeatedIn2023 = new(2023, 3, 1);
    private static readonly DateOnly SeatedIn2024 = new(2024, 3, 1);

    private readonly ApiTestFixture _fixture;

    public GetClubHubBoardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryNoSeats_When_TheClubHasRecordedNoVorstand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => MemberNamedMira(identity)),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        Assert.Empty(result.Board);
    }

    [Fact]
    public async Task Should_CarryTheSeatsInFunktionOrder_When_TheVorstandIsStaffed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity)
                            .AddPerson("nadine", "Nadine", "Wolters")
                            .AddPerson("ilka", "Ilka", "Reineke")
                    )
                    .Club(club =>
                        club.AddBoardOffice("finanzen", "Finanzen", sortOrder: 5)
                            .AddBoardOffice("praesident", "Präsident", sortOrder: 1)
                            .AddBoardSeat("ilka-finanzen", "finanzen", "ilka", SeatedIn2024)
                            .AddBoardSeat("nadine-praesident", "praesident", "nadine", SeatedIn2023)
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        Assert.Equal(["Präsident", "Finanzen"], result.Board.Select(seat => seat.OfficeName));
        Assert.Equal([1, 5], result.Board.Select(seat => seat.SortOrder));
        var praesident = result.Board[0];
        Assert.Equal(ctx.Identity.People.IdOf("nadine"), praesident.Person.PersonId);
        Assert.Equal("Nadine", praesident.Person.FirstName);
        Assert.Equal("Wolters", praesident.Person.LastName);
        Assert.Equal("Präsident", praesident.Person.OfficeName);
    }

    [Fact]
    public async Task Should_OrderByLastName_When_TwoPeopleShareAFunktion()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity)
                            .AddPerson("nadine", "Nadine", "Wolters")
                            .AddPerson("ilka", "Ilka", "Ärmel")
                    )
                    .Club(club =>
                        club.AddBoardOffice("kinderpraesident", "Kinderpräsident", sortOrder: 6)
                            .AddBoardSeat(
                                "nadine-kinderpraesident",
                                "kinderpraesident",
                                "nadine",
                                SeatedIn2023
                            )
                            .AddBoardSeat(
                                "ilka-kinderpraesident",
                                "kinderpraesident",
                                "ilka",
                                SeatedIn2024
                            )
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        Assert.Equal(["Ärmel", "Wolters"], result.Board.Select(seat => seat.Person.LastName));
        Assert.Equal(
            ["Kinderpräsident", "Kinderpräsident"],
            result.Board.Select(seat => seat.OfficeName)
        );
    }

    [Fact]
    public async Task Should_ElideTheSeat_When_TheVorstandssitzHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "nadine-praesident",
                                "praesident",
                                "nadine",
                                SeatedIn2023,
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        Assert.Empty(result.Board);
    }

    [Fact]
    public async Task Should_ElideTheSeat_When_TheVorstandssitzStartsTomorrow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "nadine-praesident",
                                "praesident",
                                "nadine",
                                _fixture.Today.AddDays(1)
                            )
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        Assert.Empty(result.Board);
    }

    [Fact]
    public async Task Should_CarryTheSeat_When_TheVorstandssitzEndsToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "nadine-praesident",
                                "praesident",
                                "nadine",
                                SeatedIn2023,
                                _fixture.Today
                            )
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        var seat = Assert.Single(result.Board);
        Assert.Equal("Präsident", seat.OfficeName);
    }

    [Fact]
    public async Task Should_LeaveThePortraetPrivate_When_AVorstandssitzIsRunning()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat("nadine-praesident", "praesident", "nadine", SeatedIn2023)
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        var seat = Assert.Single(result.Board);
        Assert.Null(seat.Person.PortraitUrl);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("nadine"))
            .ToHavePortrait(null, portraitIsPublic: false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NameTheAushangAutorsFunktion_When_SheHoldsARunningVorstandssitz()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat("nadine-praesident", "praesident", "nadine", SeatedIn2023)
                            .AddAnnouncement("gruss", "nadine", "Gruß", "Helau.")
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        var newest = Assert.Single(result.Announcements.Newest);
        Assert.Equal(ctx.Identity.People.IdOf("nadine"), newest.Author.PersonId);
        Assert.Equal("Präsident", newest.Author.OfficeName);
    }

    [Fact]
    public async Task Should_NameTheSchluesseltraegersFunktion_When_SheHoldsARunningVorstandssitz()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat("nadine-praesident", "praesident", "nadine", SeatedIn2023)
                            .AddVenue("heim", "Vereinsheim")
                            .AddKeyHolding("nadine-heim", "heim", "nadine", SeatedIn2024)
                    ),
            ct
        );

        var result = await HubForAsync(ctx, ct);

        var venue = Assert.Single(result.Venues);
        var holder = Assert.Single(venue.Holders);
        Assert.Equal(ctx.Identity.People.IdOf("nadine"), holder.Person.PersonId);
        Assert.Equal("Präsident", holder.Person.OfficeName);
    }

    private static IdentitySeedBuilder MemberNamedMira(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("mira", "Mira", "Buschmann")
            .AddAccount("mira")
            .AddMembership("mira-first", "mira", JoinedIn2017);

    private static async Task<GetClubHubResponse> HubForAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
