using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetClubHubBoardTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly SeatedIn2023 = new(2023, 3, 1);

    private readonly ApiTestFixture _fixture;

    public GetClubHubBoardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ElideTheSeat_When_TheBoardSeatHasEnded()
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
    public async Task Should_CarryTheSeat_When_TheBoardSeatEndsToday()
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
