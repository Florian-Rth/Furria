using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

[Collection("Api")]
public sealed class GetStartTests
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    private static readonly DateTimeOffset TuesdayEvening = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset HalfPastMidnightOnTheEleventhInBerlin = new(
        2026,
        11,
        10,
        23,
        30,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoOneIsSignedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture.CreateClient().GETAsync<GetStart, GetStartResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccountWasDisabledAfterItsTokenWasIssued()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder.Identity(identity =>
                            identity
                                .AddPerson("lena", "Lena", "Garde")
                                .AddAccount("lena")
                                .AddMembership("lena-member", "lena", JoinedIn2015)
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);
                await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("lena"), ct);

                var (response, _) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnInactiveAndNoPanels_When_TheAccountHasNoTieToTheClub()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder => builder.Identity(identity => identity.AddAccount("gast")),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("gast", ct);

                var (response, result) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.False(result.ViewerIsActiveInClub);
                Assert.Empty(result.Panels);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnActive_When_TheViewerOnlyAdministersAGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity
                                    .AddPerson("sabine", "Sabine", "Trainerin")
                                    .AddAccount("sabine")
                            )
                            .Groups(groups =>
                                groups
                                    .AddGroup("kindergarde", "Kindergarde")
                                    .AddGroupAdmin(
                                        "sabine-kindergarde",
                                        "kindergarde",
                                        "sabine",
                                        "Trainerin",
                                        JoinedIn2015
                                    )
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("sabine", ct);

                var (response, result) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.True(result.ViewerIsActiveInClub);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnActive_When_TheViewerOnlyHoldsABoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity.AddPerson("berta", "Berta", "Beisitz").AddAccount("berta")
                            )
                            .Club(club =>
                                club.AddBoardOffice("beisitz", "Beisitzerin")
                                    .AddBoardSeat("berta-beisitz", "beisitz", "berta", JoinedIn2015)
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("berta", ct);

                var (response, result) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.True(result.ViewerIsActiveInClub);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnABerlinToday_When_UtcIsStillOnThePreviousDay()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            HalfPastMidnightOnTheEleventhInBerlin,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder.Identity(identity =>
                            identity
                                .AddPerson("lena", "Lena", "Garde")
                                .AddAccount("lena")
                                .AddMembership("lena-member", "lena", JoinedIn2015)
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var (response, result) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(new DateOnly(2026, 11, 11), result.Today);
                Assert.Equal(HalfPastMidnightOnTheEleventhInBerlin, result.AsOf);
                Assert.Equal(
                    new DateTimeOffset(2026, 11, 11, 23, 0, 0, TimeSpan.Zero),
                    result.ReshapeAt
                );
            }
        );
    }
}
