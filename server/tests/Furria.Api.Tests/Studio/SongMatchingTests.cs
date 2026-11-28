using Furria.Api.Tests.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class SongMatchingTests
{
    private const int MarchItem = 11;
    private const int PolkaItem = 12;
    private const int WaltzItem = 13;

    private static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    private static readonly SoundSignal Polka = SoundSamples.Song(seed: 11, bpm: 132, seconds: 60);
    private static readonly SoundSignal Waltz = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);
    private static readonly CutSound MarchSong = new(
        new MusicCut(MarchItem, 10, 50),
        SoundProfile.Of(March)
    );
    private static readonly CutSound PolkaSong = new(
        new MusicCut(PolkaItem, 0, 40),
        SoundProfile.Of(Polka)
    );
    private static readonly CutSound WaltzSong = new(
        new MusicCut(WaltzItem, 0, 45),
        SoundProfile.Of(Waltz)
    );
    private static readonly SoundProfile FinalMix = SoundProfile.Of(
        Joined(SoundSamples.Excerpt(March, 5, 50), SoundSamples.Excerpt(Polka, 0, 40))
    );
    private static readonly SoundProfile LiveFinalMix = SoundProfile.Of(
        Joined(
            SoundSamples.Excerpt(March, 5, 50),
            SoundSamples.Faster(SoundSamples.Excerpt(Polka, 0, 40), 1.02)
        )
    );

    [Theory]
    [InlineData(MarchItem, 5, 1)]
    [InlineData(PolkaItem, 45, 1 / 1.02)]
    public void Should_FindTheSongWithItsTempo_When_TheNewFilePlaysItFaster(
        int source,
        double expectedStartSeconds,
        double expectedStretch
    )
    {
        var found = SongMatching.FoundIn(LiveFinalMix, source == MarchItem ? MarchSong : PolkaSong);

        Assert.NotNull(found);
        Assert.Equal(expectedStretch, found.Value.Placement.Stretch, 0.001);
        Assert.Equal(expectedStartSeconds, found.Value.NewStartSeconds, 0.05);
    }

    [Fact]
    public void Should_FindNothing_When_TheSongIsNotInTheNewFile()
    {
        Assert.Null(SongMatching.FoundIn(FinalMix, WaltzSong));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    public void Should_OfferTheNeighbouringSongs_When_TheNewFileAlsoHoldsThem(int songIndex)
    {
        var run = SongMatching.RunAround(FinalMix, [MarchSong, PolkaSong, WaltzSong], songIndex);

        Assert.NotNull(run);
        Assert.Equal(0, run.FirstIndex);
        Assert.Equal([MarchItem, PolkaItem], run.Songs.Select(song => song.Cut.SourceMediaItemId));
    }

    [Fact]
    public void Should_OfferNoNeighbour_When_ItPlaysOnTheOtherSideInTheNewFile()
    {
        var run = SongMatching.RunAround(FinalMix, [PolkaSong, MarchSong], 0);

        Assert.NotNull(run);
        Assert.Equal([PolkaItem], run.Songs.Select(song => song.Cut.SourceMediaItemId));
    }

    [Fact]
    public void Should_FindNoRun_When_TheNewFilePlaysTheSongsInAnotherOrder()
    {
        Assert.Null(SongMatching.FoundInOrder(FinalMix, [PolkaSong, MarchSong]));
    }

    private static SoundSignal Joined(SoundSignal first, SoundSignal second) =>
        new([.. first.Samples, .. second.Samples], first.SampleRate);
}
