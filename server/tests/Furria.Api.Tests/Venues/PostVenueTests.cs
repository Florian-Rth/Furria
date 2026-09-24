using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class PostVenueTests
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
    public async Task Should_RecordTheAddress_When_TheKeyHolderCreatesTheVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostVenue,
            PostVenueRequest,
            PostVenueResponse
        >(
            new()
            {
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = Hint,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Venue(result.VenueId)
            .ToHaveName("Turnhalle")
            .Venue(result.VenueId)
            .ToHaveAddress(Street, Zip, City)
            .Venue(result.VenueId)
            .ToHaveHint(Hint)
            .Venue(result.VenueId)
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordNoHint_When_TheVenueNeedsNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostVenue,
            PostVenueRequest,
            PostVenueResponse
        >(
            new()
            {
                Name = "Vereinsraum",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Venue(result.VenueId).ToHaveHint(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AVenueCarriesTheNameInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "Requisitenlager",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheAddressIsMissing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "Turnhalle",
                Street = "",
                Zip = "",
                City = "",
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<PostVenue, PostVenueRequest, PostVenueResponse>(
            new()
            {
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
