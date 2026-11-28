using Furria.Core.Sound;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class BeatTrackerTests
{
    [Fact]
    public void Should_FindTempoAndFirstBeat_When_TheSongStartsAfterSilence()
    {
        var song = SoundSamples.Song(seed: 11, bpm: 128, seconds: 45, leadingSilenceSeconds: 0.75);

        var grid = BeatTracker.Of(song);

        Assert.NotNull(grid);
        Assert.Equal(128, grid.TempoBpm, 0.1);
        Assert.Equal(0.75, grid.FirstBeatSeconds, 0.02);
    }

    [Fact]
    public void Should_KeepTheTempo_When_TheSongIsRecordedInAHall()
    {
        var song = SoundSamples.Song(seed: 5, bpm: 96, seconds: 40);

        var grid = BeatTracker.Of(
            SoundSamples.RecordedInAHall(song, roomSecondsBefore: 1, seed: 8)
        );

        Assert.NotNull(grid);
        Assert.Equal(96, grid.TempoBpm, 0.2);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public void Should_PutTheFirstBeatOnTheBarsOne_When_TheOneIsAccented(int pickupBeats)
    {
        var song = SoundSamples.SongWithAccentedOnes(
            seed: 3,
            bpm: 120,
            seconds: 40,
            leadingSilenceSeconds: 0.5,
            pickupBeats
        );

        var grid = BeatTracker.Of(song);

        Assert.NotNull(grid);
        Assert.Equal(0.5 + pickupBeats * 0.5, grid.FirstBeatSeconds, 0.05);
    }

    [Fact]
    public void Should_KeepTheFirstSoundingBeat_When_TheOneAndTheThreeSoundAlike()
    {
        var song = SoundSamples.SongWithBackbeat(
            seed: 7,
            bpm: 110,
            seconds: 40,
            leadingSilenceSeconds: 0.5
        );

        var grid = BeatTracker.Of(song);

        Assert.NotNull(grid);
        Assert.Equal(0.5, grid.FirstBeatSeconds, 0.05);
    }

    [Fact]
    public void Should_KeepTheFirstSoundingBeat_When_TheSongIsTooShortToHearEightBars()
    {
        var song = SoundSamples.SongWithAccentedOnes(
            seed: 3,
            bpm: 120,
            seconds: 12,
            leadingSilenceSeconds: 0.5,
            pickupBeats: 2
        );

        var grid = BeatTracker.Of(song);

        Assert.NotNull(grid);
        Assert.Equal(0.5, grid.FirstBeatSeconds, 0.05);
    }

    [Fact]
    public void Should_KeepTheFirstSoundingBeat_When_TheLoudestLowBeatIsNotAccented()
    {
        var song = SoundSamples.SongWithAnticipatedBass(
            seed: 3,
            bpm: 120,
            seconds: 40,
            leadingSilenceSeconds: 0.5,
            pickupBeats: 2
        );

        var grid = BeatTracker.Of(song);

        Assert.NotNull(grid);
        Assert.Equal(0.5, grid.FirstBeatSeconds, 0.05);
    }
}
