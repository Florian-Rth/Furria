using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class SongReplacementTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int Live = 13;
    private const int Rehearsal = 99;
    private const int NewFile = 50;
    private const double NewLength = 200;

    private static readonly MusicCut OpenerCut = new(Opener, 0, 60);
    private static readonly MusicCut FinaleCut = new(Finale, 0, 70);
    private static readonly MusicCut LiveCut = new(Live, 0, 60);
    private static readonly IReadOnlyList<MusicCut> Chain = [OpenerCut, FinaleCut, LiveCut];

    private static readonly SongReplacement OpenerReplaced = new(
        NewFile,
        NewLength,
        Chain,
        [new FoundSong(OpenerCut, new SongPlacement(-5, 0.98))]
    );

    private static readonly SongReplacement IntroCutAway = new(
        NewFile,
        NewLength,
        Chain,
        [new FoundSong(OpenerCut, new SongPlacement(-20, 1))]
    );

    private static readonly SongReplacement FinalMix = new(
        NewFile,
        NewLength,
        Chain,
        [
            new FoundSong(OpenerCut, new SongPlacement(0, 1)),
            new FoundSong(FinaleCut, new SongPlacement(58, 1)),
        ]
    );

    [Theory]
    [InlineData(Opener, 20, 20)]
    [InlineData(Finale, 10, 68)]
    public void Should_MoveEachAnchorWithItsOwnSong_When_SongsAreMerged(
        int source,
        double seconds,
        double expectedSeconds
    )
    {
        Assert.Equal(
            new MusicAnchor(NewFile, expectedSeconds),
            FinalMix.Rewritten(new MusicAnchor(source, seconds))
        );
    }

    [Theory]
    [InlineData(Live, 10)]
    [InlineData(Rehearsal, 3)]
    public void Should_KeepTheAnchor_When_ItsSongIsNotReplaced(int source, double seconds)
    {
        var anchor = new MusicAnchor(source, seconds);

        Assert.Equal(anchor, FinalMix.Rewritten(anchor));
    }

    [Fact]
    public void Should_EndAtTheEndOfTheNewFile_When_AnEndMapsPastIt()
    {
        var replacement = new SongReplacement(
            NewFile,
            100,
            Chain,
            [new FoundSong(FinaleCut, new SongPlacement(60, 1))]
        );

        Assert.Equal(
            [new StepAnchors(1, new MusicAnchor(NewFile, 90), new MusicAnchor(NewFile, 100))],
            replacement.RewrittenSteps([
                new StepAnchors(1, new MusicAnchor(Finale, 30), new MusicAnchor(Finale, 70)),
            ])
        );
    }

    [Fact]
    public void Should_MoveACutAwayAnchorWithTheSongBeforeIt_When_ThatSongIsReplaced()
    {
        var firstHalf = new MusicCut(Opener, 10, 20);
        var secondHalf = new MusicCut(Opener, 30, 40);
        var replacement = new SongReplacement(
            NewFile,
            NewLength,
            [firstHalf, secondHalf],
            [
                new FoundSong(firstHalf, new SongPlacement(100, 1)),
                new FoundSong(secondHalf, new SongPlacement(0, 1)),
            ]
        );

        Assert.Equal(
            new MusicAnchor(NewFile, 125),
            replacement.Rewritten(new MusicAnchor(Opener, 25))
        );
    }

    [Fact]
    public void Should_KeepACutAwayAnchor_When_TheSongBeforeItStays()
    {
        var firstHalf = new MusicCut(Opener, 10, 20);
        var secondHalf = new MusicCut(Opener, 30, 40);
        var replacement = new SongReplacement(
            NewFile,
            NewLength,
            [firstHalf, secondHalf],
            [new FoundSong(secondHalf, new SongPlacement(0, 1))]
        );
        var anchor = new MusicAnchor(Opener, 25);

        Assert.Equal(anchor, replacement.Rewritten(anchor));
    }

    [Theory]
    [InlineData(20, 3, 11.6, 0)]
    [InlineData(2, 5, 0, 8.04)]
    public void Should_KeepTheVideosLeadIn_When_ItsMusicMovesOntoTheNewFile(
        double musicSeconds,
        double videoSeconds,
        double expectedMusicSeconds,
        double expectedVideoSeconds
    )
    {
        var rewritten = OpenerReplaced.Rewritten(
            new VideoAnchor(new MusicAnchor(Opener, musicSeconds), videoSeconds)
        );

        Assert.Equal(NewFile, rewritten.Music.SourceMediaItemId);
        Assert.Equal(expectedMusicSeconds, rewritten.Music.Seconds, 9);
        Assert.Equal(expectedVideoSeconds, rewritten.VideoSeconds, 9);
    }

    [Fact]
    public void Should_EndAStepWhereTheNextBegins_When_ACrossfadeMakesThemOverlap()
    {
        var rewritten = FinalMix.RewrittenSteps([
            new StepAnchors(1, new MusicAnchor(Opener, 40), new MusicAnchor(Opener, 60)),
            new StepAnchors(2, new MusicAnchor(Finale, 0), new MusicAnchor(Finale, 20)),
        ]);

        Assert.Equal(
            [
                new StepAnchors(1, new MusicAnchor(NewFile, 40), new MusicAnchor(NewFile, 58)),
                new StepAnchors(2, new MusicAnchor(NewFile, 58), new MusicAnchor(NewFile, 78)),
            ],
            rewritten
        );
    }

    [Fact]
    public void Should_LeaveTheStepsBeforeTheNewFileWhereTheyWere_When_ItStartsLaterInTheSong()
    {
        var rewritten = IntroCutAway.RewrittenSteps([
            new StepAnchors(1, new MusicAnchor(Opener, 0), new MusicAnchor(Opener, 5)),
            new StepAnchors(2, new MusicAnchor(Opener, 5), new MusicAnchor(Opener, 10)),
            new StepAnchors(3, new MusicAnchor(Opener, 10), new MusicAnchor(Opener, 30)),
            new StepAnchors(4, new MusicAnchor(Opener, 30), new MusicAnchor(Opener, 40)),
        ]);

        Assert.Equal(
            [
                new StepAnchors(1, new MusicAnchor(Opener, 0), new MusicAnchor(Opener, 5)),
                new StepAnchors(2, new MusicAnchor(Opener, 5), new MusicAnchor(Opener, 10)),
                new StepAnchors(3, new MusicAnchor(NewFile, 0), new MusicAnchor(NewFile, 10)),
                new StepAnchors(4, new MusicAnchor(NewFile, 10), new MusicAnchor(NewFile, 20)),
            ],
            rewritten
        );
    }

    [Theory]
    [InlineData(5, Opener, 5)]
    [InlineData(19.97, NewFile, 0)]
    [InlineData(25, NewFile, 5)]
    public void Should_MoveOnlyTheKeyframesInTheNewFile_When_ItStartsLaterInTheSong(
        double seconds,
        int expectedSource,
        double expectedSeconds
    )
    {
        var rewritten = IntroCutAway.Rewritten(new MusicAnchor(Opener, seconds));

        Assert.Equal(expectedSource, rewritten.SourceMediaItemId);
        Assert.Equal(expectedSeconds, rewritten.Seconds, 9);
    }

    [Fact]
    public void Should_MoveOnlyTheKeyframesOfReplacedSongs_When_TheChoreographyIsRewritten()
    {
        var document = new ChoreographyDocument([
            new SpotTrack(1, [KeyframeAt(Finale, 10), KeyframeAt(Live, 3)]),
        ]);

        var rewritten = FinalMix.Rewritten(document);

        Assert.Equal(
            [new MusicAnchor(NewFile, 68), new MusicAnchor(Live, 3)],
            rewritten.Tracks.Single().Keyframes.Select(keyframe => keyframe.At)
        );
    }

    [Fact]
    public void Should_SpanTheNewSongFromTheFirstToTheLastReplacedSong_When_SongsAreMerged()
    {
        Assert.Equal(new MusicCut(NewFile, 0, 128), FinalMix.NewCut);
    }

    [Fact]
    public void Should_CarryAHandSetBeatAlong_When_OneSongIsReplaced()
    {
        Assert.Equal(4.8, OpenerReplaced.NewFirstBeatSeconds(10)!.Value, 9);
        Assert.Equal(120 / 0.98, OpenerReplaced.NewTempoBpm(120)!.Value, 9);
    }

    [Fact]
    public void Should_LeaveTheBeatToTheNewFile_When_SongsAreMerged()
    {
        Assert.Null(FinalMix.NewFirstBeatSeconds(10));
        Assert.Null(FinalMix.NewTempoBpm(120));
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
