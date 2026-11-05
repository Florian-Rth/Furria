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
public sealed class PutSeatingStandardTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutSeatingStandardTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheNewStandard_When_TheHallManagerChangesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var response = await client.PUTAsync<PutSeatingStandard, PutSeatingStandardRequest>(
            Standard(comfortable: 70, maximum: 50)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, seating) = await client.GETAsync<GetSeating, GetSeatingResponse>();
        Assert.Equal(70, seating.Standard.ComfortableChairSpacingCm);
        Assert.Equal(50, seating.Standard.MaximumChairSpacingCm);
        Assert.Equal(100, seating.Standard.AisleWidthCm);
    }

    [Fact]
    public async Task Should_Refuse_When_FullSeatingWouldSpaceChairsWiderThanComfortable()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var response = await client.PUTAsync<PutSeatingStandard, PutSeatingStandardRequest>(
            Standard(comfortable: 50, maximum: 60)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static PutSeatingStandardRequest Standard(int comfortable, int maximum) =>
        new()
        {
            ComfortableChairSpacingCm = comfortable,
            MaximumChairSpacingCm = maximum,
            ChairDepthCm = 50,
            AisleWidthCm = 100,
            ExitClearanceCm = 120,
        };
}
