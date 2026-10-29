using Furria.Core.Sound;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class SoundComparisonTests
{
    private static readonly SoundSignal Song = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);

    [Fact]
    public void Should_AlignWithoutShift_When_TheSameSongIsCompared()
    {
        var alignment = Align(Song, Song);

        Assert.Equal(0, alignment.OffsetSeconds, 0.01);
        Assert.True(alignment.Confidence > 0.95, $"confidence {alignment.Confidence}");
    }

    [Fact]
    public void Should_FindWhereTheCutStarts_When_TheSongWasTrimmed()
    {
        var trimmed = SoundSamples.Excerpt(Song, 12.34, 41);

        var alignment = Align(Song, trimmed);

        Assert.Equal(12.34, alignment.OffsetSeconds, 0.02);
        Assert.True(alignment.Confidence > 0.9, $"confidence {alignment.Confidence}");
    }

    [Fact]
    public void Should_FindWhereTheMusicStarts_When_AHallRecordingWithNoiseIsCompared()
    {
        var recording = SoundSamples.RecordedInAHall(
            SoundSamples.Excerpt(Song, 0, 40),
            roomSecondsBefore: 2.5,
            seed: 3
        );

        var alignment = Align(Song, recording);

        Assert.Equal(-2.5, alignment.OffsetSeconds, 0.04);
        Assert.True(alignment.Confidence > 0.4, $"confidence {alignment.Confidence}");
    }

    [Fact]
    public void Should_BeUnsure_When_TwoDifferentSongsAreCompared()
    {
        var otherSong = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);

        var alignment = Align(Song, otherSong);

        Assert.True(alignment.Confidence < 0.3, $"confidence {alignment.Confidence}");
    }

    [Fact]
    public void Should_AlignAsBefore_When_TheProfilesWereStoredAndReadBack()
    {
        var trimmed = SoundSamples.Excerpt(Song, 5, 30);

        var alignment = SoundComparison.Align(
            SoundProfile.Parse(SoundProfile.Of(Song).ToBytes())!,
            SoundProfile.Parse(SoundProfile.Of(trimmed).ToBytes())!
        )!;

        Assert.Equal(5, alignment.OffsetSeconds, 0.02);
    }

    private static SoundAlignment Align(SoundSignal reference, SoundSignal other) =>
        SoundComparison.Align(SoundProfile.Of(reference), SoundProfile.Of(other))!;
}
