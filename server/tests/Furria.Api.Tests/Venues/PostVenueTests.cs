using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

public sealed class PostVenueTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string Street = "Am Sportplatz 7";
    private const string Zip = "99713";
    private const string City = "Großfurra";
    private const string Hint = "Zugang über den Hof";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AVenueCarriesTheNameInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diesen Ort gibt es schon."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_OnlyAnArchivedVenueCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("altes-lager", "Requisitenlager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "Requisitenlager",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
