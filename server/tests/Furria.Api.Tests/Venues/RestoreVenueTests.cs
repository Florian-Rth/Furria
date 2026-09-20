using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class RestoreVenueTests
{
    private const string ConflictField = "conflict";
    private const int UnknownVenueId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LetTheOrtRunAgain_When_TheKeyHolderHoltIhnZurueck()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
    public async Task Should_KeepJedenSchluessel_When_TheOrtIsRestored()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
    public async Task Should_ReturnConflict_When_TheOrtIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("halle") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Dieser Ort ist nicht archiviert."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOrtIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = UnknownVenueId }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldClubManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schluesselpflege",
                            "schluesselpflege-holding",
                            "Schlüsselpflege",
                            "anna",
                            FurriaPermissions.KeyHoldingsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<RestoreVenue, RestoreVenueRequest>(
            new() { VenueId = ctx.Club.Venues.IdOf("altes-lager") }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
