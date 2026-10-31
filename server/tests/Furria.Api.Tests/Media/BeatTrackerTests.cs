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

    [Fact]
    public void Should_FindNoBeat_When_TheRecordingIsSilent()
    {
        Assert.Null(BeatTracker.Of(SoundSamples.Silence(10)));
    }
}
