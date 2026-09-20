using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class PutVenueTests
{
    private const string ConflictField = "conflict";
    private const string Street = "Am Sportplatz 7";
    private const string Zip = "99713";
    private const string City = "Großfurra";
    private const int UnknownVenueId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheNewAnschrift_When_TheKeyHolderUmziehtDenOrt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue(
                        "halle",
                        "Turnhalle",
                        street: "Schulstraße 4",
                        zip: "99713",
                        city: "Großfurra",
                        hint: "Zugang über den Hof"
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("halle"),
                Name = "Sporthalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveName("Sporthalle")
            .Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveAddress(Street, Zip, City)
            .Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveHint(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherOrtCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("halle", "Turnhalle").AddVenue("lager", "Requisitenlager")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diesen Ort gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveName("Requisitenlager")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepItsName_When_OnlyTheAnschriftChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("halle"),
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveAddress(Street, Zip, City)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheOrtIsArchived()
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
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                Name = "Neues Lager",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveName("Altes Lager")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOrtIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = UnknownVenueId,
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
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
                    .Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("halle"),
                Name = "Sporthalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveName("Turnhalle")
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
