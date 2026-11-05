using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Endpoints.Seating;
using Furria.Api.Endpoints.TablePlans;
using Furria.Core.Halls;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Halls.HallSeeds;
using static Furria.Api.Tests.Halls.HallSteps;

namespace Furria.Api.Tests.Halls;

[SeedsAliases]
public sealed class PostHallTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostHallTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StartAnEmptyHall_When_TheHallManagerNamesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), " Saal ");

        var (_, hall) = await client.GETAsync<GetHallById, GetHallByIdRequest, GetHallByIdResponse>(
            new() { HallId = hallId }
        );
        Assert.Equal("Saal", hall.Name);
        Assert.Equal("Bürgerhaus", hall.VenueName);
        Assert.Empty(hall.Document.Elements);
        Assert.Equal(1, hall.Version);
    }

    [Fact]
    public async Task Should_Refuse_When_TheVenueHasAHallOfThatName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var venueId = ctx.Club.Venues.IdOf(Buergerhaus);
        await CreateHallAsync(client, venueId, "Saal");

        var (response, _) = await client.POSTAsync<PostHall, PostHallRequest, PostHallResponse>(
            new() { VenueId = venueId, Name = "Saal" }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Theory]
    [InlineData(OldHall)]
    [InlineData(null)]
    public async Task Should_Refuse_When_TheVenueIsArchivedOrUnknown(string? venueAlias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var venueId = venueAlias is null ? 99_999 : ctx.Club.Venues.IdOf(venueAlias);

        var (response, _) = await client.POSTAsync<PostHall, PostHallRequest, PostHallResponse>(
            new() { VenueId = venueId, Name = "Saal" }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }
}
