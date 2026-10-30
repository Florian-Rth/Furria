using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ActStepsTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int Rehearsal = 99;

    private static readonly ActMusic Mix = new([
        new MusicCut(Opener, 10, 40),
        new MusicCut(Finale, 5, 25),
    ]);

    [Fact]
    public void Should_TileTheWholeMixWithoutGaps_When_StepsAreMarked()
    {
        var tiling = ActSteps.Tile(
            [
                new StepStart(3, new MusicAnchor(Finale, 10)),
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Opener, 30)),
            ],
            Mix
        );

        Assert.Equal(
            [new StepSpan(1, 0, 20), new StepSpan(2, 20, 35), new StepSpan(3, 35, 50)],
            tiling.Spans
        );
    }

    [Fact]
    public void Should_StretchTheFirstStepToTheStart_When_ItsBeginningWasCutAway()
    {
        var recut = new ActMusic([new MusicCut(Opener, 20, 40), new MusicCut(Finale, 5, 25)]);

        var tiling = ActSteps.Tile(
            [
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Opener, 30)),
            ],
            recut
        );

        Assert.Equal([new StepSpan(2, 0, 40)], tiling.Spans);
        Assert.Equal([1], tiling.AdriftStepIds);
    }

    [Fact]
    public void Should_SetTheStepAdrift_When_ItsSongLeftTheMix()
    {
        var tiling = ActSteps.Tile(
            [
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Rehearsal, 3)),
            ],
            Mix
        );

        Assert.Equal([new StepSpan(1, 0, 50)], tiling.Spans);
        Assert.Equal([2], tiling.AdriftStepIds);
    }

    [Fact]
    public void Should_SplitTheStep_When_AMarkFallsInsideIt()
    {
        var tiling = ActSteps.Tile([new StepStart(1, new MusicAnchor(Opener, 10))], Mix);

        var mark = ActSteps.MarkAt(tiling, 35, Mix);

        Assert.Null(mark.Refusal);
        Assert.Equal([new MusicAnchor(Finale, 10)], mark.NewStarts);
    }

    [Fact]
    public void Should_OpenAStepAtTheStartToo_When_TheFirstMarkIsSetLater()
    {
        var tiling = ActSteps.Tile([], Mix);

        var mark = ActSteps.MarkAt(tiling, 12, Mix);

        Assert.Equal([new MusicAnchor(Opener, 10), new MusicAnchor(Opener, 22)], mark.NewStarts);
    }

    [Fact]
    public void Should_OpenOneStep_When_TheFirstMarkIsSetAtTheStart()
    {
        var tiling = ActSteps.Tile([], Mix);

        var mark = ActSteps.MarkAt(tiling, 0, Mix);

        Assert.Equal([new MusicAnchor(Opener, 10)], mark.NewStarts);
    }

    [Theory]
    [InlineData(20, StepMarkRefusal.OnABorder)]
    [InlineData(20.005, StepMarkRefusal.OnABorder)]
    [InlineData(0, StepMarkRefusal.OnABorder)]
    [InlineData(50, StepMarkRefusal.OutsideTheMusic)]
    [InlineData(-1, StepMarkRefusal.OutsideTheMusic)]
    public void Should_RefuseTheMark_When_ItSplitsNothing(
        double timelineSeconds,
        StepMarkRefusal expected
    )
    {
        var tiling = ActSteps.Tile(
            [
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Opener, 30)),
            ],
            Mix
        );

        var mark = ActSteps.MarkAt(tiling, timelineSeconds, Mix);

        Assert.Equal(expected, mark.Refusal);
        Assert.Empty(mark.NewStarts);
    }

    [Theory]
    [InlineData(2, 25, null)]
    [InlineData(2, 0.005, StepMarkRefusal.BeyondANeighbour)]
    [InlineData(2, 50, StepMarkRefusal.BeyondANeighbour)]
    [InlineData(1, 5, StepMarkRefusal.FirstStep)]
    [InlineData(3, 25, StepMarkRefusal.Adrift)]
    public void Should_MoveAStepStartOnlyBetweenItsNeighbours_When_ItsBorderIsDragged(
        int stepId,
        double timelineSeconds,
        StepMarkRefusal? expected
    )
    {
        var tiling = ActSteps.Tile(
            [
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Opener, 30)),
                new StepStart(3, new MusicAnchor(Rehearsal, 3)),
            ],
            Mix
        );

        var move = ActSteps.MoveTo(tiling, stepId, timelineSeconds, Mix);

        Assert.Equal(expected, move.Refusal);
    }

    [Fact]
    public void Should_AnchorTheMovedStartInItsSong_When_ItCrossesASongCut()
    {
        var tiling = ActSteps.Tile(
            [
                new StepStart(1, new MusicAnchor(Opener, 10)),
                new StepStart(2, new MusicAnchor(Opener, 30)),
            ],
            Mix
        );

        var move = ActSteps.MoveTo(tiling, 2, 40, Mix);

        Assert.Equal([new MusicAnchor(Finale, 15)], move.NewStarts);
    }
}
