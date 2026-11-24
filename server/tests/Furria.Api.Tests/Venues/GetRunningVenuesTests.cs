using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

public sealed class GetRunningVenuesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetRunningVenuesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OmitTheVenue_When_ItIsArchived()
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
    public async Task Should_ListTheVenues_When_TheCallerIsTiedToTheClubByAnOpenGroupMembershipOnly()
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
}
