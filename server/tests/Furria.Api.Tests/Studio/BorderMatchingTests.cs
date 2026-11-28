using Furria.Api.Tests.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class BorderMatchingTests
{
    private const int MarchItem = 11;
    private const double Precision = 0.05;

    private static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    private static readonly CutSound MarchSong = new(
        new MusicCut(MarchItem, 0, 60),
        SoundProfile.Of(March)
    );
    private static readonly SoundProfile ShortenedMarch = SoundProfile.Of(
        SongReplacementSteps.Joined(
            SoundSamples.Excerpt(March, 0, 30),
            SoundSamples.Excerpt(March, 38, 60)
        )
    );
    private static readonly SoundProfile FasterMarch = SoundProfile.Of(
        SoundSamples.Faster(March, 1.02)
    );

    [Fact]
    public void Should_MoveOnlyTheBordersAfterTheCut_When_ASectionIsShortened()
    {
        double[] borders = [10, 20, 26, 42, 50];

        var warp = WarpOf(ShortenedMarch, borders);

        AssertNear([10, 20, 26, 34, 42], [.. borders.Select(warp.NewSecondsOf)]);
        Assert.All(borders, border => Assert.True(warp.Found(border)));
    }

    [Fact]
    public void Should_PlaceABorderBetweenItsFoundNeighbours_When_ItsMusicIsCutAway()
    {
        var warp = WarpOf(ShortenedMarch, [26, 34, 42]);

        Assert.False(warp.Found(34));
        Assert.Equal(30, warp.NewSecondsOf(34), Precision);
    }

    [Theory]
    [InlineData(15, 15)]
    [InlineData(46, 38)]
    [InlineData(55, 47)]
    public void Should_MoveMomentsWithTheBordersAroundThem_When_ASectionIsShortened(
        double oldSeconds,
        double expectedSeconds
    )
    {
        var warp = WarpOf(ShortenedMarch, [10, 20, 42, 50]);

        Assert.Equal(expectedSeconds, warp.NewSecondsOf(oldSeconds), Precision);
    }

    [Fact]
    public void Should_FindTheBordersInTheNewTempo_When_TheNewFilePlaysFaster()
    {
        double[] borders = [10, 30, 50];

        var warp = WarpOf(FasterMarch, borders);

        AssertNear(
            [.. borders.Select(border => border / 1.02)],
            [.. borders.Select(warp.NewSecondsOf)]
        );
        Assert.All(borders, border => Assert.True(warp.Found(border)));
    }

    [Fact]
    public void Should_KeepTheSongsPlacement_When_NoBorderIsFound()
    {
        var hallRecording = SoundProfile.Of(SoundSamples.RecordedInAHall(March, 0, seed: 3));
        var placement = new SongPlacement(0.5, 1);

        var warp = BorderMatching.WarpOf(hallRecording, MarchSong, placement, [10, 30]);

        Assert.False(warp.Found(10));
        Assert.Equal(placement.NewSecondsOf(30), warp.NewSecondsOf(30), 9);
    }

    private static SongWarp WarpOf(SoundProfile newFile, IReadOnlyList<double> borders)
    {
        var song = SongMatching.FoundIn(newFile, MarchSong);
        Assert.NotNull(song);

        return BorderMatching.WarpOf(newFile, MarchSong, song.Value.Placement, borders);
    }

    private static void AssertNear(IReadOnlyList<double> expected, IReadOnlyList<double> actual)
    {
        Assert.Equal(expected.Count, actual.Count);
        foreach (var (wanted, found) in expected.Zip(actual))
            Assert.Equal(wanted, found, Precision);
    }
}
