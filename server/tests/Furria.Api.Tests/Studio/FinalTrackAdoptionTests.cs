using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class FinalTrackAdoptionTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int Rehearsal = 99;
    private const int FinalFile = 50;

    private static readonly FinalTrackAdoption Adoption = new(
        FinalFile,
        120,
        new Dictionary<int, double> { [Opener] = -5, [Finale] = 60 }
    );

    [Theory]
    [InlineData(Opener, 10, 5)]
    [InlineData(Opener, 5, 0)]
    [InlineData(Finale, 0, 60)]
    [InlineData(Finale, 60, 120)]
    public void Should_MoveTheAnchorOntoTheFinalFile_When_ItsMusicIsAligned(
        int source,
        double seconds,
        double expectedSeconds
    )
    {
        var rewritten = Adoption.Rewritten(new MusicAnchor(source, seconds));

        Assert.Equal(new MusicAnchor(FinalFile, expectedSeconds), rewritten);
    }

    [Theory]
    [InlineData(Rehearsal, 12)]
    [InlineData(Opener, 4.9)]
    [InlineData(Finale, 60.1)]
    public void Should_KeepTheAnchor_When_ItsMusicIsNotInTheFinalFile(int source, double seconds)
    {
        var anchor = new MusicAnchor(source, seconds);

        Assert.Equal(anchor, Adoption.Rewritten(anchor));
    }

    [Theory]
    [InlineData(20, 3, 12, 0)]
    [InlineData(6, 3, 0, 2)]
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
