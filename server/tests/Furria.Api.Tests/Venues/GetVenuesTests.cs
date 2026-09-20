using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

[Collection("Api")]
public sealed class GetVenuesTests
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetVenuesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListRunningOrteInGermanNameOrderBeforeArchivedOnes_When_TheBackOfficeIsRead()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string[] inOrder = ["Ölmagazin", "Requisitenlager", "Turnhalle", "Altes Lager"];
        Assert.Equal(inOrder, result.Venues.Select(venue => venue.Name));
    }

    [Fact]
    public async Task Should_CarryTheArchivedOrtWithItsStichtag_When_AnOrtWasArchived()
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
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal(ctx.Club.Venues.IdOf("altes-lager"), venue.VenueId);
        Assert.Equal(ArchivedIn2021, venue.ArchivedOn);
    }

    [Fact]
    public async Task Should_CarryTheAnschriftAndDenHinweis_When_TheOrtRecordsThem()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal("Am Sportplatz 7", venue.Street);
        Assert.Equal("99713", venue.Zip);
        Assert.Equal("Großfurra", venue.City);
        Assert.Equal("Zugang über den Hof", venue.Hint);
    }

    [Fact]
    public async Task Should_CarryNoHinweis_When_TheOrtNeedsNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(Assert.Single(result.Venues).Hint);
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
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "anna",
                            FurriaPermissions.GroupsManage
                        )
                    )
                    .Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.GETAsync<GetVenues, GetVenuesResponse>();

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

        var (response, _) = await _fixture.CreateClient().GETAsync<GetVenues, GetVenuesResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
