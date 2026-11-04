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
public sealed class GetHallByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetHallByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheDrawingAsSaved_When_TheHallWasDrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await client.PUTAsync<PutHall, PutHallRequest, PutHallResponse>(
            new()
            {
                HallId = hallId,
                Name = "Saal",
                Version = 1,
                Document = new HallDocumentDto { Elements = [Wall("w1"), Stage("a1")] },
            }
        );

        var (response, hall) = await client.GETAsync<
            GetHallById,
            GetHallByIdRequest,
            GetHallByIdResponse
        >(new() { HallId = hallId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, hall.Version);
        Assert.Equal(["w1", "a1"], hall.Document.Elements.Select(element => element.Id));
        Assert.Equal(
            ["0,0", "2000,0", "2000,1500"],
            hall.Document.Elements[0].Points!.Select(point => $"{point.X},{point.Y}")
        );
        Assert.Equal(HallAreaKind.Stage, hall.Document.Elements[1].Area);
        Assert.Null(hall.Document.Elements[0].Label);
    }
}
