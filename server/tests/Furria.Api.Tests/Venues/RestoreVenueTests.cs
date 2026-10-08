using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class RestoreVenueTests
{
    private const string ConflictField = "conflict";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LetTheVenueRunAgain_When_TheKeyHolderRestoresIt()
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
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToBeOpen()
            .Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveName("Altes Lager")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepEveryKey_When_TheVenueIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("bea", "Bea", "Kessler"))
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                            .AddKeyHolding("bea-lager", "altes-lager", "bea", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-lager"))
            .ToHavePeriod(HeldSince2024, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVenueIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("halle") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Dieser Ort ist nicht archiviert."], failures[ConflictField]);
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
