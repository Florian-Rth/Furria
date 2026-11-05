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
public sealed class PutHallTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutHallTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheDrawingAndCountTheVersionUp_When_TheVersionIsCurrent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var (response, result) = await SaveAsync(client, hallId, 1, "Großer Saal", [Wall("w1")]);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.Version);
        var (_, hall) = await client.GETAsync<GetHallById, GetHallByIdRequest, GetHallByIdResponse>(
            new() { HallId = hallId }
        );
        Assert.Equal("Großer Saal", hall.Name);
        Assert.Single(hall.Document.Elements);
    }

    [Fact]
    public async Task Should_Refuse_When_SomeoneSavedMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await SaveAsync(client, hallId, 1, "Saal", [Wall("w1")]);

        var (response, _) = await SaveAsync(client, hallId, 1, "Saal", [Stage("a1")]);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_AnElementLacksItsShape()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var (response, _) = await SaveAsync(
            client,
            hallId,
            1,
            "Saal",
            [Wall("w1") with { Points = [new PlanPointDto { X = 0, Y = 0 }] }]
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepTheMergedOutline_When_AnAreaIsAPolygon()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        await SaveAsync(
            client,
            hallId,
            1,
            "Saal",
            [MergedStage("a1", (0, 0), (600, 0), (600, 200), (300, 200), (300, 400), (0, 400))]
        );

        var (_, hall) = await client.GETAsync<GetHallById, GetHallByIdRequest, GetHallByIdResponse>(
            new() { HallId = hallId }
        );
        var area = hall.Document.Elements.Single();
        Assert.Equal(HallAreaShape.Polygon, area.Shape);
        Assert.Equal(6, area.Points?.Count);
    }

    [Fact]
    public async Task Should_ReadAnAreaAsARectangle_When_ItWasSavedWithoutAShape()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        await SaveAsync(client, hallId, 1, "Saal", [Stage("a1")]);

        var (_, hall) = await client.GETAsync<GetHallById, GetHallByIdRequest, GetHallByIdResponse>(
            new() { HallId = hallId }
        );
        Assert.Equal(HallAreaShape.Rect, hall.Document.Elements.Single().Shape);
    }

    [Fact]
    public async Task Should_Refuse_When_AMergedAreaHasFewerThanThreeCorners()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var (response, _) = await SaveAsync(
            client,
            hallId,
            1,
            "Saal",
            [MergedStage("a1", (0, 0), (600, 0))]
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static Task<TestResult<PutHallResponse>> SaveAsync(
        HttpClient client,
        int hallId,
        int version,
        string name,
        IReadOnlyList<HallElementDto> elements
    ) =>
        client.PUTAsync<PutHall, PutHallRequest, PutHallResponse>(
            new()
            {
                HallId = hallId,
                Name = name,
                Version = version,
                Document = new HallDocumentDto { Elements = elements },
            }
        );
}
