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

    [Fact]
    public async Task Should_ListTheOpeningHoursFromMondayOn_When_TheVenueKeepsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var nine = new TimeOnly(9, 0);
        var noon = new TimeOnly(12, 0);
        var two = new TimeOnly(14, 0);
        var six = new TimeOnly(18, 0);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("baeckerei", "Bäckerei Schmidt")
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Sunday, nine, noon)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Monday, two, six)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Saturday, nine, noon)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Monday, nine, noon)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal(
            [
                new OpeningSlotDto
                {
                    Weekday = DayOfWeek.Monday,
                    Opens = nine,
                    Closes = noon,
                },
                new OpeningSlotDto
                {
                    Weekday = DayOfWeek.Monday,
                    Opens = two,
                    Closes = six,
                },
                new OpeningSlotDto
                {
                    Weekday = DayOfWeek.Saturday,
                    Opens = nine,
                    Closes = noon,
                },
                new OpeningSlotDto
                {
                    Weekday = DayOfWeek.Sunday,
                    Opens = nine,
                    Closes = noon,
                },
            ],
            venue.OpeningHours
        );
    }

    [Fact]
    public async Task Should_CarryTheArchivedVenueWithItsArchiveDate_When_TheVenueWasArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal(ctx.Club.Venues.IdOf("altes-lager"), venue.VenueId);
        Assert.Equal(ArchivedIn2021, venue.ArchivedOn);
    }

    [Fact]
    public async Task Should_CarryTheAddressAndTheHint_When_TheVenueRecordsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue(
                        "halle",
                        "Turnhalle",
                        street: "Am Sportplatz 7",
                        zip: "99713",
                        city: "Großfurra",
                        hint: "Zugang über den Hof"
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal("Am Sportplatz 7", venue.Street);
        Assert.Equal("99713", venue.Zip);
        Assert.Equal("Großfurra", venue.City);
        Assert.Equal("Zugang über den Hof", venue.Hint);
    }

    [Fact]
    public async Task Should_CarryNoHint_When_TheVenueNeedsNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(Assert.Single(result.Venues).Hint);
    }
}
