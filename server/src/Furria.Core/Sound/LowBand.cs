using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class LowBand
{
    private const double CutoffHz = 150;

    [Pure]
    public static double[] EnergiesOf(SoundSignal signal)
    {
        var hop = signal.SampleRate / BandOnsets.FramesPerSecond;
        var share = 1 - Math.Exp(-2 * Math.PI * CutoffHz / signal.SampleRate);
        var energies = new double[(signal.Samples.Length + hop - 1) / hop];
        var (once, twice) = (0.0, 0.0);
        for (var index = 0; index < signal.Samples.Length; index++)
        {
            once += share * (signal.Samples[index] - once);
            twice += share * (once - twice);
            energies[index / hop] += twice * twice;
        }

        return [.. energies.Select((sum, frame) => sum / SamplesIn(frame, hop, signal))];
    }

    [Pure]
    private static int SamplesIn(int frame, int hop, SoundSignal signal) =>
        Math.Min(hop, signal.Samples.Length - frame * hop);
}
