using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

public sealed class GetBoardTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly Elected2020 = new(2020, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);

    private readonly ApiTestFixture _fixture;

    public GetBoardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetBoardResponse>> ReadBoardAsync(HttpClient client) =>
        client.GETAsync<GetBoard, GetBoardResponse>();

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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

    private static BoardOfficeDto OfficeOf(GetBoardResponse response, int boardOfficeId) =>
        response.Offices.Single(office => office.BoardOfficeId == boardOfficeId);
}
