using Furria.Api.Tests.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class FinalTrackMatchingTests
{
    private const int MarchItem = 11;
    private const int PolkaItem = 12;

    private static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    private static readonly SoundSignal Polka = SoundSamples.Song(seed: 11, bpm: 132, seconds: 60);
    private static readonly SoundProfile FinalFile = SoundProfile.Of(
        Joined(SoundSamples.Excerpt(March, 5, 50), SoundSamples.Excerpt(Polka, 0, 40))
    );

    [Theory]
    [InlineData(MarchItem, 10, 50, -5)]
    [InlineData(PolkaItem, 0, 40, 45)]
    public void Should_FindWhereTheSongLiesInTheFinalFile_When_TechJoinedTheCuts(
        int source,
        double cutStart,
        double cutEnd,
        double expectedOffset
    )
    {
        var sound = source == MarchItem ? March : Polka;

        var alignment = FinalTrackMatching.OffsetOf(
            new CutSound(new MusicCut(source, cutStart, cutEnd), SoundProfile.Of(sound)),
            FinalFile
        );

        Assert.NotNull(alignment);
        Assert.Equal(expectedOffset, alignment.OffsetSeconds, 0.05);
    }

    [Fact]
    public void Should_FindNothing_When_TheSongIsNotInTheFinalFile()
    {
        var other = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);

        var alignment = FinalTrackMatching.OffsetOf(
            new CutSound(new MusicCut(MarchItem, 0, 45), SoundProfile.Of(other)),
            FinalFile
        );

        Assert.Null(alignment);
    }

    private static SoundSignal Joined(SoundSignal first, SoundSignal second) =>
        new([.. first.Samples, .. second.Samples], first.SampleRate);
}
