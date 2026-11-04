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
public sealed class DeleteHallByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteHallByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheHall_When_NoPlanUsesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var response = await client.DELETEAsync<DeleteHallById, DeleteHallByIdRequest>(
            new() { HallId = hallId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, halls) = await client.GETAsync<GetHalls, GetHallsResponse>();
        Assert.Empty(halls.Halls);
    }

    [Fact]
    public async Task Should_Refuse_When_APlanStandsInTheHall()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, ctx.Club.Events.IdOf(Gala), hallId);

        var response = await client.DELETEAsync<DeleteHallById, DeleteHallByIdRequest>(
            new() { HallId = hallId }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
