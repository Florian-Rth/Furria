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
public sealed class DeleteTableTypeByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteTableTypeByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheType_When_NoPlanUsesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var response = await client.DELETEAsync<DeleteTableTypeById, DeleteTableTypeByIdRequest>(
            new() { TableTypeId = RoundTableId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        Assert.DoesNotContain(seating.TableTypes, type => type.TableTypeId == RoundTableId);
    }

    [Fact]
    public async Task Should_ArchiveTheType_When_APlanUsesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);
        await SavedPlanAsync(client, eventId, hallId, 1, [Row("r1", RoundTableId, 1)]);

        await client.DELETEAsync<DeleteTableTypeById, DeleteTableTypeByIdRequest>(
            new() { TableTypeId = RoundTableId }
        );

        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        Assert.True(seating.TableTypes.Single(type => type.TableTypeId == RoundTableId).Archived);
    }
}
