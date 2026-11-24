using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

public sealed class GetVenuesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetVenuesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListRunningVenuesInGermanNameOrderBeforeArchivedOnes_When_TheBackOfficeIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("halle", "Turnhalle")
                        .AddVenue("magazin", "Ölmagazin")
                        .AddVenue("lager", "Requisitenlager")
                        .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string[] inOrder = ["Ölmagazin", "Requisitenlager", "Turnhalle", "Altes Lager"];
        Assert.Equal(inOrder, result.Venues.Select(venue => venue.Name));
    }
}
