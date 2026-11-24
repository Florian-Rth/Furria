using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Keys;

public sealed class GetKeyHoldingsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);

    private readonly ApiTestFixture _fixture;

    public GetKeyHoldingsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MarkTheHolderInactive_When_HerLastTieEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var yesterday = today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Perlberg")
                            .AddMembership("maik-membership", "maik", today.AddYears(-3), yesterday)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("maennerballett", "Männerballett")
                            .AddGroupMembership(
                                "maik-maennerballett",
                                "maennerballett",
                                "maik",
                                today.AddYears(-3),
                                yesterday
                            )
                            .AddGroupAdmin(
                                "maik-maennerballett-admin",
                                "maennerballett",
                                "maik",
                                "Trainer",
                                today.AddYears(-2),
                                yesterday
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat(
                                "maik-kassenwart",
                                "kassenwart",
                                "maik",
                                today.AddYears(-2),
                                yesterday
                            )
                            .AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var holding = await ReadHoldingAsync(client, ctx.Club.KeyHoldings.IdOf("maik-lager"));

        Assert.False(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderActive_When_SheOnlyHoldsABoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("frank", "Frank", "Heller"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "frank-praesident",
                                "praesident",
                                "frank",
                                today.AddYears(-1)
                            )
                            .AddVenue("vereinsraum", "Vereinsraum")
                            .AddKeyHolding(
                                "frank-vereinsraum",
                                "vereinsraum",
                                "frank",
                                HeldSince2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var holding = await ReadHoldingAsync(
            client,
            ctx.Club.KeyHoldings.IdOf("frank-vereinsraum")
        );

        Assert.True(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderInactive_When_SheOnlyAdministersAnArchivedGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("sabine", "Sabine", "Rothe"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde", archivedOn: today.AddDays(-1))
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                "Trainerin",
                                today.AddYears(-1)
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddKeyHolding(
                                "sabine-sporthalle",
                                "sporthalle",
                                "sabine",
                                HeldSince2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var holding = await ReadHoldingAsync(
            client,
            ctx.Club.KeyHoldings.IdOf("sabine-sporthalle")
        );

        Assert.False(holding.HolderIsActiveInClub);
    }

    private static async Task<KeyHoldingSummaryDto> ReadHoldingAsync(
        HttpClient client,
        int keyHoldingId
    )
    {
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result
            .Venues.SelectMany(venue => venue.Holdings)
            .Single(holding => holding.KeyHoldingId == keyHoldingId);
    }
}
