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
public sealed class GetSeatingTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetSeatingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheClubStandardAndItsTableTypes_When_NothingWasChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var (response, result) = await client.GETAsync<GetSeating, GetSeatingResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new SeatingStandardDto
            {
                ComfortableChairSpacingCm = 60,
                MaximumChairSpacingCm = 45,
                ChairDepthCm = 50,
                AisleWidthCm = 120,
                ExitClearanceCm = 120,
            },
            result.Standard
        );
        Assert.Equal(
            ["Biertisch 220×50 Rectangle", "Tisch 120×80 Rectangle", "Rund 160×160 Round"],
            result.TableTypes.Select(type =>
                $"{type.Name} {type.LengthCm}×{type.WidthCm} {type.Shape}"
            )
        );
    }
}
