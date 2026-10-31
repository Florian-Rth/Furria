using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ChoreographyCheckTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int FinalFile = 13;
    private const int StrangeSong = 99;
    private const int SpotOne = 1;
    private const int SpotTwo = 2;
    private const int UnknownSpot = 7;

    private static readonly ChoreographyFrame Frame = new(
        new HashSet<int> { SpotOne, SpotTwo },
        new HashSet<int> { Opener, Finale, FinalFile },
        new ActMusic([new MusicCut(Opener, 10, 40), new MusicCut(Finale, 5, 25)]),
        new StageSize(12, 8)
    );

    [Fact]
    public void Should_FindNoProblem_When_EverySpotMovesForwardOnTheStage()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(
                SpotOne,
                [At(Opener, 10, -6, 0), At(Opener, 20, 0, 4, facing: 180), At(Finale, 5, 6, 8)]
            ),
            new SpotTrack(SpotTwo, [At(Opener, 10, 1, 1)]),
        ]);

        Assert.Empty(ChoreographyCheck.ProblemsOf(document, Frame));
    }

    [Theory]
    [InlineData(-6.1, 4)]
    [InlineData(6.1, 4)]
    [InlineData(0, -0.1)]
    [InlineData(0, 8.1)]
    public void Should_FlagTheKeyframe_When_ItStandsOffTheStage(double right, double back)
    {
        var document = new ChoreographyDocument([
            new SpotTrack(SpotOne, [At(Opener, 10, 0, 0), At(Opener, 20, right, back)]),
        ]);

        Assert.Equal(
            [new ChoreographyProblem(ChoreographyProblemKind.OutsideTheStage, SpotOne, 1)],
            ChoreographyCheck.ProblemsOf(document, Frame)
        );
    }

    [Fact]
    public void Should_FlagTheTrack_When_ItsSpotIsNotPartOfTheAct()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(UnknownSpot, [At(Opener, 10, 0, 0)]),
        ]);

        Assert.Equal(
            [new ChoreographyProblem(ChoreographyProblemKind.UnknownSpot, UnknownSpot, null)],
            ChoreographyCheck.ProblemsOf(document, Frame)
        );
    }

    [Fact]
    public void Should_FlagTheSpot_When_ItIsTrackedTwice()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(SpotOne, [At(Opener, 10, 0, 0)]),
            new SpotTrack(SpotOne, [At(Opener, 20, 0, 0)]),
        ]);

        Assert.Equal(
            [new ChoreographyProblem(ChoreographyProblemKind.SpotTrackedTwice, SpotOne, null)],
            ChoreographyCheck.ProblemsOf(document, Frame)
        );
    }

    [Fact]
    public void Should_FlagTheKeyframe_When_ItHangsOnMusicTheActDoesNotHave()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(SpotOne, [At(StrangeSong, 3, 0, 0)]),
        ]);

        Assert.Equal(
            [new ChoreographyProblem(ChoreographyProblemKind.UnknownMusic, SpotOne, 0)],
            ChoreographyCheck.ProblemsOf(document, Frame)
        );
    }

    [Fact]
    public void Should_FlagEveryKeyframeThatGoesBack_When_TheTrackRunsAgainstTheMusic()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(
                SpotOne,
                [
                    At(Opener, 30, 0, 0),
                    At(Opener, 20, 0, 0),
                    At(Opener, 25, 0, 0),
                    At(Opener, 30, 0, 0),
                    At(Finale, 10, 0, 0),
                ]
            ),
        ]);

        Assert.Equal(
            [1, 2, 3],
            ChoreographyCheck
                .ProblemsOf(document, Frame)
                .Where(problem => problem.Kind == ChoreographyProblemKind.OutOfMusicOrder)
                .Select(problem => problem.KeyframeIndex ?? -1)
        );
    }

    [Fact]
    public void Should_LeaveTheKeyframeInPlace_When_ItsMusicWasCutAwayOrIsOnTheFinalFile()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(
                SpotOne,
                [At(Opener, 30, 0, 0), At(Opener, 5, 0, 0), At(FinalFile, 1, 0, 0)]
            ),
        ]);

        Assert.Empty(ChoreographyCheck.ProblemsOf(document, Frame));
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(360)]
    public void Should_FlagTheFacing_When_ItLeavesTheCircle(double facing)
    {
        var document = new ChoreographyDocument([
            new SpotTrack(SpotOne, [At(Opener, 10, 0, 0, facing)]),
        ]);

        Assert.Equal(
            [new ChoreographyProblem(ChoreographyProblemKind.FacingOutOfRange, SpotOne, 0)],
            ChoreographyCheck.ProblemsOf(document, Frame)
        );
    }

    private static Keyframe At(
        int source,
        double seconds,
        double right,
        double back,
        double? facing = null
    ) =>
        new(
            new MusicAnchor(source, seconds),
            new StagePoint(right, back),
            null,
            KeyframeEasing.Linear,
            facing
        );
}
