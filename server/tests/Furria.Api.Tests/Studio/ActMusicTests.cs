using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ActMusicTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int Rehearsal = 99;

    private static readonly ActMusic Mix = new([
        new MusicCut(Opener, 10, 40),
        new MusicCut(Finale, 5, 25),
    ]);

    private static readonly ActMusic SplitMix = new([
        new MusicCut(Opener, 10, 20),
        new MusicCut(Opener, 30, 40),
        new MusicCut(Finale, 5, 25),
    ]);

    [Theory]
    [InlineData(Opener, 25.5, 15.5)]
    [InlineData(Finale, 5, 30)]
    public void Should_PlaceTheAnchorOnTheMix_When_ItsMusicIsKept(
        int source,
        double seconds,
        double expectedTimelineSeconds
    )
    {
        var place = Mix.Locate(new MusicAnchor(source, seconds));

        Assert.Equal(AnchorPlace.At(expectedTimelineSeconds), place);
    }

    [Theory]
    [InlineData(Opener, 9.9)]
    [InlineData(Opener, 41)]
    public void Should_FlagTheAnchorAsCutAway_When_ItsMusicLiesOutsideTheCut(
        int source,
        double seconds
    )
    {
        var place = Mix.Locate(new MusicAnchor(source, seconds));

        Assert.Equal(AnchorPlace.CutAway, place);
    }

    [Fact]
    public void Should_FlagTheAnchorAsMissing_When_ItsSongIsNotInTheMix()
    {
        var place = Mix.Locate(new MusicAnchor(Rehearsal, 12));

        Assert.Equal(AnchorPlace.MusicMissing, place);
    }

    [Fact]
    public void Should_MoveTheAnchorWithItsMusic_When_TheSongBeforeIsRecut()
    {
        var recut = new ActMusic([new MusicCut(Opener, 20, 40), new MusicCut(Finale, 5, 25)]);

        var place = recut.Locate(new MusicAnchor(Finale, 15));

        Assert.Equal(AnchorPlace.At(30), place);
    }

    [Theory]
    [InlineData(29.5, Opener, 39.5)]
    [InlineData(30, Finale, 5)]
    public void Should_AnchorAMomentInItsSong_When_ItLiesInsideTheMix(
        double timelineSeconds,
        int expectedSource,
        double expectedSeconds
    )
    {
        var anchor = Mix.AnchorAt(timelineSeconds);

        Assert.Equal(new MusicAnchor(expectedSource, expectedSeconds), anchor);
    }

    [Theory]
    [InlineData(Opener, 30, 10)]
    [InlineData(Finale, 6, 21)]
    public void Should_PlaceTheAnchorInItsPiece_When_TheSongIsSplitIntoPieces(
        int source,
        double seconds,
        double expectedTimelineSeconds
    )
    {
        var place = SplitMix.Locate(new MusicAnchor(source, seconds));

        Assert.Equal(AnchorPlace.At(expectedTimelineSeconds), place);
    }

    [Fact]
    public void Should_PlaceTheAnchorAtTheEndOfAPiece_When_ItSitsOnThatPiecesEnd()
    {
        var place = SplitMix.Locate(new MusicAnchor(Opener, 20));

        Assert.Equal(AnchorPlace.At(10), place);
    }

    [Theory]
    [InlineData(60.009, 60.0, false)]
    [InlineData(60.02, 60.0, true)]
    public void Should_RefuseAMomentPastTheFile_When_ItLiesBeyondItsLength(
        double? seconds,
        double? durationSeconds,
        bool expectedPastTheEnd
    )
    {
        Assert.Equal(expectedPastTheEnd, MusicFile.IsPastTheEnd(seconds, durationSeconds));
    }
}
