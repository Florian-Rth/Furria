using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class BarOne
{
    private const int BeatsPerBar = 4;
    private const int FewestBars = 8;
    private const int AccentReachFrames = 2;
    private const int LowReachFrames = 12;
    private const double ClearLowLead = 0.4;

    [Pure]
    public static int? BeatOf(BarOneEvidence evidence, double firstBeatFrame, double periodFrames)
    {
        var phases = PhasesOf(evidence, firstBeatFrame, periodFrames);
        if (phases.Any(phase => phase.Beats < FewestBars))
            return null;

        var ranked = Enumerable
            .Range(0, BeatsPerBar)
            .OrderByDescending(beat => phases[beat].MeanLow)
            .ToArray();
        var (loudest, runnerUp) = (phases[ranked[0]], phases[ranked[1]]);
        var isAccented = loudest.MeanAccent >= phases.Average(phase => phase.MeanAccent);
        return LeadsClearly(loudest, runnerUp) && isAccented ? ranked[0] : null;
    }

    [Pure]
    private static bool LeadsClearly(BeatPhase loudest, BeatPhase runnerUp) =>
        loudest.MeanLow > 0
        && (loudest.MeanLow - runnerUp.MeanLow) / loudest.MeanLow >= ClearLowLead;

    [Pure]
    private static BeatPhase[] PhasesOf(
        BarOneEvidence evidence,
        double firstBeatFrame,
        double periodFrames
    )
    {
        var phases = Enumerable.Range(0, BeatsPerBar).Select(_ => new BeatPhase()).ToArray();
        var index = 0;
        for (
            var position = firstBeatFrame;
            position < evidence.Accents.Length;
            position += periodFrames, index++
        )
            phases[index % BeatsPerBar] = phases[index % BeatsPerBar]
                .With(AccentAt(evidence.Accents, position), LowAt(evidence.LowEnergies, position));
        return phases;
    }

    [Pure]
    private static double AccentAt(double[] accents, double position)
    {
        var centre = (int)Math.Round(position);
        var strongest = 0.0;
        for (
            var frame = Math.Max(0, centre - AccentReachFrames);
            frame <= Math.Min(accents.Length - 1, centre + AccentReachFrames);
            frame++
        )
            strongest = Math.Max(strongest, accents[frame]);
        return strongest;
    }

    [Pure]
    private static double LowAt(double[] energies, double position)
    {
        var start = Math.Min(energies.Length, (int)position);
        var end = Math.Min(energies.Length, start + LowReachFrames);
        var sum = 0.0;
        for (var frame = start; frame < end; frame++)
            sum += energies[frame];
        return end > start ? sum / (end - start) : 0;
    }

    private sealed record BeatPhase(int Beats = 0, double AccentSum = 0, double LowSum = 0)
    {
        public double MeanAccent => Beats == 0 ? 0 : AccentSum / Beats;

        public double MeanLow => Beats == 0 ? 0 : LowSum / Beats;

        [Pure]
        public BeatPhase With(double accent, double low) =>
            new(Beats + 1, AccentSum + accent, LowSum + low);
    }
}
