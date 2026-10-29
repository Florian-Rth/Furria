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

    [Theory]
    [InlineData(Opener, 10, 0)]
    [InlineData(Opener, 25.5, 15.5)]
    [InlineData(Finale, 5, 30)]
    [InlineData(Finale, 25, 50)]
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
    [InlineData(Finale, 0)]
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
    [InlineData(0, Opener, 10)]
    [InlineData(29.5, Opener, 39.5)]
    [InlineData(30, Finale, 5)]
    [InlineData(50, Finale, 25)]
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
    [InlineData(-0.1)]
    [InlineData(50.1)]
    public void Should_AnchorNothing_When_TheMomentLiesOutsideTheMix(double timelineSeconds)
    {
        Assert.Null(Mix.AnchorAt(timelineSeconds));
    }
}
