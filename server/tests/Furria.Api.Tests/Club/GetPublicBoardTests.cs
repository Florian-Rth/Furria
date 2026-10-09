using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetPublicBoardTests : IClassFixture<ApiTestFixture>
{
    private const string PublicBoardRoute = "/api/public/board";

    private static readonly DateOnly SeatedIn2023 = new(2023, 11, 11);
    private static readonly DateOnly SeatedIn2016 = new(2016, 11, 11);
    private static readonly DateOnly StoodDownIn2020 = new(2020, 11, 10);
    private static readonly DateOnly SeatedNextYear = new(2027, 11, 11);

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
    public async Task Should_ShowThePortraitToAnyone_When_ItsHolderSitsInAPublicOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatNadineInAPublicOfficeAsync(ct);
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Identity.People.IdOf("nadine"),
            ct
        );
        await _fixture.PlaceRenditionAsync(portraitId, MediaRendition.Small, [1, 2, 3], ct);

        var seat = Assert.Single((await ReadTheBoardAsync()).Seats);
        var portrait = await _fixture.CreateClient().GetAsync(seat.Portrait!.SmallUrl, ct);

        Assert.Equal(HttpStatusCode.OK, portrait.StatusCode);
    }

    [Fact]
    public async Task Should_ShowNoPortraitYet_When_ItsFirstRenditionsAreStillBeingMade()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatNadineInAPublicOfficeAsync(ct);
        await PictureSteps.UploadedPortraitAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Identity.People.IdOf("nadine"),
            ct
        );

        var seat = Assert.Single((await ReadTheBoardAsync()).Seats);

        Assert.Null(seat.Portrait);
    }

    [Fact]
    public async Task Should_LeaveOutSeatsThatEndedOrHaveNotBegun_When_TheBoardIsRead()
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
                                    .AddPerson("otto", "Otto", "Früher")
                                    .AddPerson("bea", "Bea", "Bald")
                            )
                            .Club(club =>
                                club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                                    .AddBoardSeat(
                                        "otto-p",
                                        "praesident",
                                        "otto",
                                        SeatedIn2016,
                                        StoodDownIn2020
                                    )
                                    .AddBoardSeat("bea-p", "praesident", "bea", SeatedNextYear)
                            ),
                    ct
                );

                var result = await ReadTheBoardAsync();

                Assert.Empty(result.Seats);
            }
        );
    }

    [Fact]
    public async Task Should_FollowTheBoardsDisplayOrder_When_SeveralPublicOfficesAreHeld()
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
                                club.AddBoardOffice("kassenwart", "Kassenwart", 2, isPublic: true)
                                    .AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                                    .AddBoardSeat("tom-k", "kassenwart", "tom", SeatedIn2023)
                                    .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023)
                            ),
                    ct
                );

                var result = await ReadTheBoardAsync();

                Assert.Equal(
                    ["Präsident", "Kassenwart"],
                    result.Seats.Select(seat => seat.OfficeName)
                );
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

    private Task<SeededContext> SeatNadineInAPublicOfficeAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("nadine", "Nadine", "Wolters"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, isPublic: true)
                            .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023)
                    ),
            ct
        );

    private async Task<GetPublicBoardResponse> ReadTheBoardAsync()
    {
        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicBoard, GetPublicBoardResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
