using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetPublicBoardTests : IClassFixture<ApiTestFixture>
{
    private const string PublicBoardRoute = "/api/public/board";

    private static readonly DateOnly SeatedIn2023 = new(2023, 11, 11);

    private static readonly DateTimeOffset InOctober2026 = new(
        2026,
        10,
        2,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetPublicBoardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowOnlyTheHoldersOfPublicOffices_When_AnAnonymousCallerReadsTheBoard()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InOctober2026,
            async () =>
            {
                await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity
                                    .AddPerson("nadine", "Nadine", "Wolters")
                                    .AddPerson("tom", "Tom", "Kasse")
                            )
                            .Club(club =>
                                club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                                    .AddBoardOffice("kassenwart", "Kassenwart", 2)
                                    .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023)
                                    .AddBoardSeat("tom-k", "kassenwart", "tom", SeatedIn2023)
                            ),
                    ct
                );

                var result = await ReadTheBoardAsync();

                var seat = Assert.Single(result.Seats);
                Assert.Equal("Präsident", seat.OfficeName);
                Assert.Equal("Nadine", seat.FirstName);
                Assert.Equal("Wolters", seat.LastName);
            }
        );
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheBoardIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InOctober2026,
            async () =>
            {
                await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity
                                    .AddPerson("nadine", "Nadine", "Wolters")
                                    .AddPersonContact("nadine", email: "nadine@furria.test")
                                    .AddAccount("nadine")
                            )
                            .Club(club =>
                                club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                                    .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023)
                            ),
                    ct
                );

                var payload = await _fixture.CreateClient().GetStringAsync(PublicBoardRoute, ct);

                using var document = JsonDocument.Parse(payload);
                var seat = document.RootElement.GetProperty("seats").EnumerateArray().Single();
                Assert.Equal(
                    ["officeName", "firstName", "lastName", "portrait"],
                    seat.EnumerateObject().Select(field => field.Name)
                );
            }
        );
    }

    private async Task<GetPublicBoardResponse> ReadTheBoardAsync()
    {
        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicBoard, GetPublicBoardResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
