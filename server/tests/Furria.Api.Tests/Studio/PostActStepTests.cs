using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActStepTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActStepTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId)> MusicAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_OpenAStepAtTheStartToo_When_TheFirstMarkIsSetLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);

        var stepIds = await MarkAsync(admin, actId, 30);

        Assert.Equal(2, stepIds.Count);
        Assert.Equal([(0, 30), (30, 180)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_SplitTheStep_When_AMarkFallsInsideIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        await MarkAsync(admin, actId, 30);

        var stepIds = await MarkAsync(admin, actId, 90);

        Assert.Single(stepIds);
        Assert.Equal([(0, 30), (30, 90), (90, 180)], await StepSpansOfAsync(admin, actId));
    }

    [Theory]
    [InlineData(30)]
    [InlineData(180)]
    public async Task Should_RefuseTheMark_When_ItSplitsNoStep(double atSeconds)
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        await MarkAsync(admin, actId, 30);

        var response = await admin.POSTAsync<PostActStep, PostActStepRequest>(
            new() { ActId = actId, AtSeconds = atSeconds }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheMark_When_TheActHasNoMusic()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await admin.POSTAsync<PostActStep, PostActStepRequest>(
            new() { ActId = actId, AtSeconds = 0 }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepTheStepsGaplessOrRefuse_When_EditorsMarkAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);

        var responses = await Task.WhenAll(
            new[] { 20.0, 40, 60, 80, 100, 120 }.Select(seconds =>
                admin.POSTAsync<PostActStep, PostActStepRequest>(
                    new() { ActId = actId, AtSeconds = seconds }
                )
            )
        );

        Assert.All(
            responses,
            response =>
                Assert.Contains(
                    response.StatusCode,
                    new[] { HttpStatusCode.OK, HttpStatusCode.Conflict }
                )
        );
        var added = responses.Count(response => response.StatusCode == HttpStatusCode.OK);
        Assert.InRange(added, 1, responses.Length);
        var spans = await StepSpansOfAsync(admin, actId);
        Assert.Equal(
            (added + 1, (double?)0, (double?)180),
            (spans.Length, spans[0].Start, spans[^1].End)
        );
        Assert.Equal(
            spans.Skip(1).Select(span => span.Start),
            spans.SkipLast(1).Select(span => span.End)
        );
    }
}
