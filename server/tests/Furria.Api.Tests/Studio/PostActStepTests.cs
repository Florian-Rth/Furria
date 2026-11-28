using System.Net;
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
    public async Task Should_LeaveTheMusicAroundFree_When_AStepIsCreatedBetweenOthers()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        await CreateStepAsync(admin, actId, 10, 30);
        await CreateStepAsync(admin, actId, 120, 150);

        await CreateStepAsync(admin, actId, 60, 90);

        Assert.Equal([(10, 30), (60, 90), (120, 150)], await StepSpansOfAsync(admin, actId));
    }

    [Theory]
    [InlineData(20, 40)]
    [InlineData(50, 70)]
    [InlineData(40, 50)]
    public async Task Should_RefuseTheStep_When_ItOverlapsAnother(
        double startSeconds,
        double endSeconds
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        await CreateStepAsync(admin, actId, 30, 60);

        var response = await PostStepAsync(admin, actId, startSeconds, endSeconds);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal([(30, 60)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_SplitTheStepAndKeepItsEnd_When_TheNewStepIsItsTail()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        await CreateStepAsync(admin, actId, 30, 90);

        await CreateStepAsync(admin, actId, 60, 90);

        Assert.Equal([(30, 60), (60, 90)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_KeepAskingToCheckTheOldBorders_When_AFlaggedStepIsSplit()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepId = await CreateStepAsync(admin, actId, 30, 90);
        await _fixture.FlagStepBordersForCheckAsync(stepId, ct);

        await CreateStepAsync(admin, actId, 60, 90);

        Assert.Equal([(true, false), (false, true)], await StepChecksOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_KeepBothHalvesInThePart_When_ItsLastStepIsSplit()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await StepsBetweenAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[0], stepIds[1], "Einmarsch");

        var newStepId = await SplitAsync(admin, actId, 60);

        Assert.Equal(
            [
                [stepIds[0], stepIds[1], newStepId],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_RefuseTheStep_When_TheActHasNoMusic()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await PostStepAsync(admin, actId, 0, 10);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_NeverLetStepsOverlap_When_EditorsCreateAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);

        var responses = await Task.WhenAll(
            new[] { 20.0, 30, 40, 50, 60, 70 }.Select(start =>
                PostStepAsync(admin, actId, start, start + 25)
            )
        );

        Assert.All(
            responses,
            response =>
                Assert.Contains(
                    response.StatusCode,
                    new[] { HttpStatusCode.OK, HttpStatusCode.UnprocessableEntity }
                )
        );
        var spans = await StepSpansOfAsync(admin, actId);
        Assert.Equal(
            responses.Count(response => response.StatusCode == HttpStatusCode.OK),
            spans.Length
        );
        Assert.All(
            spans.Zip(spans.Skip(1)),
            pair => Assert.True(pair.First.End <= pair.Second.Start)
        );
    }
}
