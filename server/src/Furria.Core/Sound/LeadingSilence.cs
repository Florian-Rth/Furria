using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class LeadingSilence
{
    private const double SilenceDecibels = -50;

    private static readonly float SilenceAmplitude = (float)Math.Pow(10, SilenceDecibels / 20);

    [Pure]
    public static double SecondsOf(SoundSignal signal)
    {
        var firstSound = Array.FindIndex(
            signal.Samples,
            sample => Math.Abs(sample) > SilenceAmplitude
        );
        return firstSound < 0 ? signal.DurationSeconds : (double)firstSound / signal.SampleRate;
    }
}
