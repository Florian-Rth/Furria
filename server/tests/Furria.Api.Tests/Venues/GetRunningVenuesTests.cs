using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class GetRunningVenuesTests
{
    private const string RunningVenuesRoute = "/api/venues";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetRunningVenuesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheOrteInGermanNameOrder_When_AnAffiliatedPersonReadsThePicker()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddVenue("halle", "Turnhalle")
                            .AddVenue("magazin", "Ölmagazin")
                            .AddVenue("lager", "Requisitenlager")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<
            GetRunningVenues,
            GetRunningVenuesResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string[] inOrder = ["Ölmagazin", "Requisitenlager", "Turnhalle"];
        Assert.Equal(inOrder, result.Venues.Select(venue => venue.Name));
    }

    [Fact]
    public async Task Should_OmitTheOrt_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddVenue("halle", "Turnhalle")
                            .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<
            GetRunningVenues,
            GetRunningVenuesResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var halle = Assert.Single(result.Venues);
        Assert.Equal(ctx.Club.Venues.IdOf("halle"), halle.VenueId);
    }

    [Fact]
    public async Task Should_ListTheOrte_When_TheCallerIsTiedToTheVereinByAnOffeneZugehoerigkeitOnly()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("anna-tanzgarde", "tanzgarde", "anna", JoinedIn2017)
                            .AddGroupAdmin("anna-leitet", "tanzgarde", "anna", "Trainerin")
                    )
                    .Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.GETAsync<
            GetRunningVenues,
            GetRunningVenuesResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var halle = Assert.Single(result.Venues);
        Assert.Equal(ctx.Club.Venues.IdOf("halle"), halle.VenueId);
        Assert.Equal("Turnhalle", halle.Name);
    }

    [Fact]
    public async Task Should_CarryTheIdAndTheNameOnly_When_ThePickerIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club =>
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

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(RunningVenuesRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var halle = document.RootElement.GetProperty("venues").EnumerateArray().Single();
        Assert.Equal(["venueId", "name"], halle.EnumerateObject().Select(field => field.Name));
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("tom"))
                    .Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await client.GETAsync<GetRunningVenues, GetRunningVenuesResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetRunningVenues, GetRunningVenuesResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
