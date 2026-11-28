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

    private static readonly StepTiling Spaced = ActSteps.Tile(
        [Step(2, Opener, 30, Finale, 10), Step(1, Opener, 10, Opener, 20)],
        Mix
    );

    [Fact]
    public void Should_KeepTheMusicBetweenStepsFree_When_StepsEndBeforeTheNextBegins()
    {
        Assert.Equal([new StepSpan(1, 0, 10), new StepSpan(2, 20, 35)], Spaced.Spans);
        Assert.Empty(Spaced.AdriftStepIds);
    }

    [Fact]
    public void Should_SetAStepAdrift_When_ItsBeginningWasCutAway()
    {
        var recut = new ActMusic([new MusicCut(Opener, 20, 40), new MusicCut(Finale, 5, 25)]);

        var tiling = ActSteps.Tile(
            [Step(1, Opener, 10, Opener, 25), Step(2, Opener, 30, Finale, 10)],
            recut
        );

        Assert.Equal([new StepSpan(2, 10, 25)], tiling.Spans);
        Assert.Equal([1], tiling.AdriftStepIds);
    }

    [Fact]
    public void Should_SetAStepAdrift_When_ItsEndIsNoLongerPlayed()
    {
        var tiling = ActSteps.Tile([Step(1, Opener, 30, Rehearsal, 3)], Mix);

        Assert.Empty(tiling.Spans);
        Assert.Equal([1], tiling.AdriftStepIds);
    }

    [Fact]
    public void Should_SetTangledStepsAdrift_When_ReorderedSongsTurnThemAround()
    {
        var reordered = new ActMusic([new MusicCut(Finale, 5, 25), new MusicCut(Opener, 10, 40)]);

        var tiling = ActSteps.Tile(
            [
                Step(1, Opener, 30, Finale, 10),
                Step(2, Finale, 5, Finale, 20),
                Step(3, Finale, 15, Opener, 15),
            ],
            reordered
        );

        Assert.Equal([new StepSpan(2, 0, 15)], tiling.Spans);
        Assert.Equal([1, 3], tiling.AdriftStepIds);
    }

    [Fact]
    public void Should_AnchorBothEnds_When_AStepIsCreatedInFreeMusic()
    {
        var creation = ActSteps.Create(Spaced, 12, 18, Mix);

        Assert.Equal(
            StepCreation.Fresh(new MusicAnchor(Opener, 22), new MusicAnchor(Opener, 28)),
            creation
        );
    }

    [Fact]
    public void Should_FillTheGap_When_TheNewStepTouchesBothNeighbours()
    {
        var creation = ActSteps.Create(Spaced, 10, 20, Mix);

        Assert.Equal(
            StepCreation.Fresh(new MusicAnchor(Opener, 20), new MusicAnchor(Opener, 30)),
            creation
        );
    }

    [Theory]
    [InlineData(30)]
    [InlineData(30.004)]
    [InlineData(29.996)]
    public void Should_AnchorAnEndOnASongBorderInTheEarlierSong_When_AStepEndsThere(
        double timelineSeconds
    )
    {
        var tiling = ActSteps.Tile([Step(1, Opener, 10, Opener, 20)], Mix);

        var move = ActSteps.MoveEnd(tiling, 1, timelineSeconds, Mix);

        Assert.Equal(StepBorderMove.To(new MusicAnchor(Opener, 40)), move);
    }

    [Fact]
    public void Should_SplitTheStep_When_TheNewStepIsItsTail()
    {
        var creation = ActSteps.Create(Spaced, 25, 35.004, Mix);

        Assert.Equal(
            StepCreation.Splitting(
                new StepSplit(2, new MusicAnchor(Opener, 35)),
                new MusicAnchor(Opener, 35)
            ),
            creation
        );
    }

    [Fact]
    public void Should_KeepTheFirstHalfInItsSong_When_AStepIsSplitOnASongBorder()
    {
        var creation = ActSteps.Create(Spaced, 30, 35, Mix);

        Assert.Equal(
            StepCreation.Splitting(
                new StepSplit(2, new MusicAnchor(Opener, 40)),
                new MusicAnchor(Finale, 5)
            ),
            creation
        );
    }

    [Theory]
    [InlineData(5, 15, StepRefusal.OverlapsAStep)]
    [InlineData(15, 25, StepRefusal.OverlapsAStep)]
    [InlineData(25, 30, StepRefusal.OverlapsAStep)]
    [InlineData(20.005, 35, StepRefusal.OverlapsAStep)]
    [InlineData(40, 40.005, StepRefusal.TooShort)]
    [InlineData(45, 55, StepRefusal.OutsideTheMusic)]
    [InlineData(50, 52, StepRefusal.OutsideTheMusic)]
    public void Should_RefuseTheStep_When_ItDoesNotFitTheFreeMusic(
        double startSeconds,
        double endSeconds,
        StepRefusal expected
    )
    {
        var creation = ActSteps.Create(Spaced, startSeconds, endSeconds, Mix);

        Assert.Equal(StepCreation.Refused(expected), creation);
    }

    [Theory]
    [InlineData(2, 10, null)]
    [InlineData(2, 9, StepRefusal.OverlapsAStep)]
    [InlineData(2, 34.995, StepRefusal.TooShort)]
    [InlineData(1, 4, null)]
    [InlineData(3, 4, StepRefusal.Adrift)]
    public void Should_MoveAStartOnlyWithinFreeMusic_When_ItIsDragged(
        int stepId,
        double timelineSeconds,
        StepRefusal? expected
    )
    {
        var move = ActSteps.MoveStart(Spaced, stepId, timelineSeconds, Mix);

        Assert.Equal(expected, move.Refusal);
    }

    [Theory]
    [InlineData(1, 20, null)]
    [InlineData(1, 21, StepRefusal.OverlapsAStep)]
    [InlineData(1, 0.005, StepRefusal.TooShort)]
    [InlineData(2, 50, null)]
    [InlineData(2, 51, StepRefusal.OutsideTheMusic)]
    public void Should_MoveAnEndOnlyWithinFreeMusic_When_ItIsDragged(
        int stepId,
        double timelineSeconds,
        StepRefusal? expected
    )
    {
        var move = ActSteps.MoveEnd(Spaced, stepId, timelineSeconds, Mix);

        Assert.Equal(expected, move.Refusal);
    }

    [Fact]
    public void Should_AnchorTheMovedStartInItsSong_When_ItCrossesASongBorder()
    {
        var tiling = ActSteps.Tile([Step(1, Opener, 10, Finale, 20)], Mix);

        var move = ActSteps.MoveStart(tiling, 1, 30, Mix);

        Assert.Equal(StepBorderMove.To(new MusicAnchor(Finale, 5)), move);
    }

    private static StepAnchors Step(
        int stepId,
        int startSource,
        double startSeconds,
        int endSource,
        double endSeconds
    ) =>
        new(
            stepId,
            new MusicAnchor(startSource, startSeconds),
            new MusicAnchor(endSource, endSeconds)
        );
}
