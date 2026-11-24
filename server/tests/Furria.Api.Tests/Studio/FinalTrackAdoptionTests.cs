using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class FinalTrackAdoptionTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int Live = 13;
    private const int Rehearsal = 99;
    private const int FinalFile = 50;

    private static readonly FinalTrackAdoption Adoption = new(
        FinalFile,
        120,
        new ActMusic([
            new MusicCut(Opener, 0, 60),
            new MusicCut(Finale, 0, 70),
            new MusicCut(Live, 0, 60),
        ]),
        [
            new SourceAlignment(Opener, 0, new(-5, 1)),
            new SourceAlignment(Finale, 0, new(60, 1)),
            new SourceAlignment(Live, 0, new(100, 0.98)),
        ]
    );

    private static readonly ActMusic SplitOpener = new([
        new MusicCut(Opener, 10, 20),
        new MusicCut(Opener, 30, 40),
    ]);

    [Theory]
    [InlineData(Opener, 10, 5)]
    [InlineData(Live, 10, 109.8)]
    public void Should_MoveTheAnchorOntoTheFinalFile_When_ItsMusicIsAligned(
        int source,
        double seconds,
        double expectedSeconds
    )
    {
        var rewritten = Adoption.Rewritten(new MusicAnchor(source, seconds));

        Assert.Equal(FinalFile, rewritten.SourceMediaItemId);
        Assert.Equal(expectedSeconds, rewritten.Seconds, 9);
    }

    [Theory]
    [InlineData(20, 20)]
    [InlineData(30, 80)]
    public void Should_MoveEachPieceWithItsOwnAlignment_When_ThePiecesSitApartInTheFinalFile(
        double seconds,
        double expectedSeconds
    )
    {
        var adoption = new FinalTrackAdoption(
            FinalFile,
            120,
            SplitOpener,
            [new SourceAlignment(Opener, 0, new(0, 1)), new SourceAlignment(Opener, 30, new(50, 1))]
        );

        Assert.Equal(
            new MusicAnchor(FinalFile, expectedSeconds),
            adoption.Rewritten(new MusicAnchor(Opener, seconds))
        );
    }

    [Theory]
    [InlineData(25, 75)]
    public void Should_MoveACutAwayAnchorWithTheAlignmentBeforeIt_When_ItLiesInNoPiece(
        double seconds,
        double expectedSeconds
    )
    {
        var adoption = new FinalTrackAdoption(
            FinalFile,
            120,
            new ActMusic([new MusicCut(Opener, 10, 20), new MusicCut(Opener, 30, 40)]),
            [
                new SourceAlignment(Opener, 20, new(50, 1)),
                new SourceAlignment(Opener, 30, new(70, 1)),
            ]
        );

        Assert.Equal(
            new MusicAnchor(FinalFile, expectedSeconds),
            adoption.Rewritten(new MusicAnchor(Opener, seconds))
        );
    }

    [Theory]
    [InlineData(Finale, 60.1)]
    public void Should_KeepTheAnchor_When_ItsMusicIsNotInTheFinalFile(int source, double seconds)
    {
        var anchor = new MusicAnchor(source, seconds);

        Assert.Equal(anchor, Adoption.Rewritten(anchor));
    }

    [Theory]
    [InlineData(20, 3, 12, 0)]
    [InlineData(2, 0, 0, 3)]
    public void Should_KeepTheVideosLeadIn_When_ItsMusicMovesOntoTheFinalFile(
        double musicSeconds,
        double videoSeconds,
        double expectedMusicSeconds,
        double expectedVideoSeconds
    )
    {
        var rewritten = Adoption.Rewritten(
            new VideoAnchor(new MusicAnchor(Opener, musicSeconds), videoSeconds)
        );

        Assert.Equal(
            new VideoAnchor(new MusicAnchor(FinalFile, expectedMusicSeconds), expectedVideoSeconds),
            rewritten
        );
    }

    [Fact]
    public void Should_MoveOnlyTheKeyframesWhoseMusicIsInTheFinalFile_When_TheChoreographyIsRewritten()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(1, [KeyframeAt(Opener, 10), KeyframeAt(Rehearsal, 3)]),
        ]);

        var rewritten = Adoption.Rewritten(document);

        Assert.Equal(
            [new MusicAnchor(FinalFile, 5), new MusicAnchor(Rehearsal, 3)],
            rewritten.Tracks.Single().Keyframes.Select(keyframe => keyframe.At)
        );
    }

    private static Keyframe KeyframeAt(int source, double seconds) =>
        new(
            new MusicAnchor(source, seconds),
            new StagePoint(0, 1),
            null,
            KeyframeEasing.Linear,
            null
        );
}
