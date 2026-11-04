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
public sealed class PostTableTypeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostTableTypeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheNewTypeLast_When_TheSaalchefAddsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);

        var (response, created) = await client.POSTAsync<
            PostTableType,
            PostTableTypeRequest,
            PostTableTypeResponse
        >(Type("Stehtisch", TableShape.Rectangle, 200, 60, seatsAtEnds: true));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        var listed = seating.TableTypes[^1];
        Assert.Equal(created.TableTypeId, listed.TableTypeId);
        Assert.Equal("Stehtisch", listed.Name);
        Assert.True(listed.SeatsAtEnds);
        Assert.False(listed.Archived);
    }

    [Fact]
    public async Task Should_MakeARoundTableAsWideAsLongWithoutEnds_When_ItIsRound()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);

        await client.POSTAsync<PostTableType, PostTableTypeRequest, PostTableTypeResponse>(
            Type("Rund groß", TableShape.Round, 180, 80, seatsAtEnds: true)
        );

        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        var listed = seating.TableTypes[^1];
        Assert.Equal(180, listed.WidthCm);
        Assert.False(listed.SeatsAtEnds);
    }

    private static PostTableTypeRequest Type(
        string name,
        TableShape shape,
        int length,
        int width,
        bool seatsAtEnds
    ) =>
        new()
        {
            Name = name,
            Shape = shape,
            LengthCm = length,
            WidthCm = width,
            SeatsAtEnds = seatsAtEnds,
        };
}
