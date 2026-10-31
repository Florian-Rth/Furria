using System.Diagnostics.Contracts;
using System.Numerics;

namespace Furria.Core.Sound;

public static class BandOnsets
{
    private const int WindowLength = 1024;
    private const double LowestHz = 100;
    private const double HighestHz = 7000;
    private const double RelativeEnergyFloor = 1e-3;
    private const double AbsoluteEnergyFloor = 1e-12;

    public const int FramesPerSecond = 100;
    public const int BandCount = 8;

    private static readonly double[] HannWindow = HannOf(WindowLength);

    [Pure]
    public static float[][] Of(SoundSignal signal)
    {
        var energies = BandEnergiesOf(signal);
        return [.. energies.Select(RisesOf)];
    }

    [Pure]
    public static int FrameCountOf(SoundSignal signal) =>
        (signal.Samples.Length + HopOf(signal) - 1) / HopOf(signal);

    [Pure]
    private static int HopOf(SoundSignal signal) => signal.SampleRate / FramesPerSecond;

    [Pure]
    private static double[][] BandEnergiesOf(SoundSignal signal)
    {
        var frameCount = FrameCountOf(signal);
        var bands = BandBinsOf(signal.SampleRate);
        var energies = Enumerable.Range(0, BandCount).Select(_ => new double[frameCount]).ToArray();
        var spectrum = new Complex[WindowLength];
        for (var frame = 0; frame < frameCount; frame++)
        {
            FillWindow(spectrum, signal, frame * HopOf(signal) - WindowLength / 2);
            Fft.Forward(spectrum);
            for (var band = 0; band < BandCount; band++)
                energies[band][frame] = EnergyBetween(spectrum, bands[band]);
        }

        return energies;
    }

    private static void FillWindow(Complex[] window, SoundSignal signal, int firstSample)
    {
        for (var index = 0; index < WindowLength; index++)
        {
            var sample = firstSample + index;
            window[index] =
                sample >= 0 && sample < signal.Samples.Length
                    ? signal.Samples[sample] * HannWindow[index]
                    : Complex.Zero;
        }
    }

    [Pure]
    private static double EnergyBetween(Complex[] spectrum, Range bins)
    {
        var (start, length) = bins.GetOffsetAndLength(spectrum.Length);
        var energy = 0.0;
        for (var bin = start; bin < start + length; bin++)
            energy +=
                spectrum[bin].Real * spectrum[bin].Real
                + spectrum[bin].Imaginary * spectrum[bin].Imaginary;
        return energy;
    }

    [Pure]
    private static float[] RisesOf(double[] energy)
    {
        var floor =
            RelativeEnergyFloor * (energy.Length == 0 ? 0 : energy.Average()) + AbsoluteEnergyFloor;
        var rises = new float[energy.Length];
        for (var frame = 1; frame < energy.Length; frame++)
            rises[frame] = (float)
                Math.Max(0, Math.Log(energy[frame] + floor) - Math.Log(energy[frame - 1] + floor));
        return rises;
    }

    [Pure]
    private static Range[] BandBinsOf(int sampleRate)
    {
        var edges = Enumerable
            .Range(0, BandCount + 1)
            .Select(edge =>
                (int)
                    Math.Round(
                        LowestHz
                            * Math.Pow(HighestHz / LowestHz, (double)edge / BandCount)
                            * WindowLength
                            / sampleRate
                    )
            )
            .ToArray();
        return
        [
            .. Enumerable
                .Range(0, BandCount)
                .Select(band => new Range(edges[band], Math.Max(edges[band] + 1, edges[band + 1]))),
        ];
    }

    [Pure]
    private static double[] HannOf(int length) =>
        [
            .. Enumerable
                .Range(0, length)
                .Select(index => 0.5 - 0.5 * Math.Cos(2 * Math.PI * index / length)),
        ];
}
