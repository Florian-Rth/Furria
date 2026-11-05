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
public sealed class PutTableTypeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutTableTypeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ChangeTheType_When_TheHallManagerEditsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var response = await client.PUTAsync<PutTableType, PutTableTypeRequest>(Edit(PlainTableId));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        var edited = seating.TableTypes.Single(type => type.TableTypeId == PlainTableId);
        Assert.Equal("Tisch lang", edited.Name);
        Assert.Equal(160, edited.LengthCm);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheTypeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var response = await client.PUTAsync<PutTableType, PutTableTypeRequest>(Edit(999));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static PutTableTypeRequest Edit(int tableTypeId) =>
        new()
        {
            TableTypeId = tableTypeId,
            Name = "Tisch lang",
            Shape = TableShape.Rectangle,
            LengthCm = 160,
            WidthCm = 80,
            SeatsAtEnds = true,
        };
}
