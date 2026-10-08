using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class ArchiveVenueTests
{
    private const string ConflictField = "conflict";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);

    private readonly ApiTestFixture _fixture;

    public ArchiveVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampToday_When_TheKeyHolderArchivesTheVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("altes-lager", "Altes Lager")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<ArchiveVenue, ArchiveVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToBeArchivedOn(_fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheAddressAndEveryKey_When_TheVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("bea", "Bea", "Kessler"))
                    .Club(club =>
                        club.AddVenue(
                                "altes-lager",
                                "Altes Lager",
                                street: "Am Sportplatz 7",
                                zip: "99713",
                                city: "Großfurra"
                            )
                            .AddKeyHolding("bea-lager", "altes-lager", "bea", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<ArchiveVenue, ArchiveVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveAddress("Am Sportplatz 7", "99713", "Großfurra")
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-lager"))
            .ToHavePeriod(HeldSince2024, null)
            .KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVenueIsAlreadyArchived()
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
        var response = await client.POSTAsync<ArchiveVenue, ArchiveVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Dieser Ort ist bereits archiviert."], failures[ConflictField]);
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
