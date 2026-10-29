using Furria.Core.Sound;

namespace Furria.Api.Tests.Media;

public static class SoundSamples
{
    private const int Rate = SoundSignal.AnalysisSampleRate;
    private const float Headroom = 0.8f;

    private static readonly double[] Scale = [220, 247, 262, 294, 330, 349, 392, 440, 494, 523];
    private static readonly double[] NoteBeats = [0.25, 0.5, 0.5, 0.75, 1, 1.5];
    private static readonly double[] CombDelaysSeconds = [0.0297, 0.0371, 0.0411, 0.0437];
    private static readonly double[] AllpassDelaysSeconds = [0.005, 0.0017];

    public static SoundSignal Song(
        int seed,
        double bpm,
        double seconds,
        double leadingSilenceSeconds = 0
    )
    {
        var random = new Random(seed);
        var samples = new float[(int)(seconds * Rate)];
        AddDrums(samples, random, bpm, leadingSilenceSeconds);
        AddMelody(samples, random, bpm, leadingSilenceSeconds);
        return new SoundSignal(Normalised(samples), Rate);
    }

    public static SoundSignal Excerpt(SoundSignal song, double fromSeconds, double toSeconds) =>
        new(
            song.Samples[
                (int)(fromSeconds * Rate)..Math.Min(song.Samples.Length, (int)(toSeconds * Rate))
            ],
            Rate
        );

    public static SoundSignal Silence(double seconds) =>
        new(new float[(int)(seconds * Rate)], Rate);

    public static SoundSignal RecordedInAHall(SoundSignal music, double roomSecondsBefore, int seed)
    {
        var random = new Random(seed);
        var lead = (int)(roomSecondsBefore * Rate);
        var samples = new float[lead + music.Samples.Length];
        for (var index = 0; index < music.Samples.Length; index++)
            samples[lead + index] = music.Samples[index] * 0.25f;

        var recorded = LowPassed(Reverberated(samples));
        AddRoomNoise(recorded, random);
        return new SoundSignal(recorded, Rate);
    }

    private static void AddDrums(float[] samples, Random random, double bpm, double start)
    {
        var eighth = 30 / bpm;
        for (
            var (time, count) = (start, 0);
            time < samples.Length / (double)Rate;
            time += eighth, count++
        )
        {
            if (random.NextDouble() < 0.05)
                continue;
            if (count % 2 == 0)
                AddKick(samples, time, 0.7 + 0.3 * random.NextDouble());
            if (count % 4 == 2)
                AddNoiseBurst(samples, random, time, 0.12, 0.45 + 0.1 * random.NextDouble());
            AddNoiseBurst(samples, random, time, 0.03, 0.12 + 0.08 * random.NextDouble());
        }
    }

    private static void AddMelody(float[] samples, Random random, double bpm, double start)
    {
        var beat = 60 / bpm;
        for (var time = start; time < samples.Length / (double)Rate; )
        {
            var duration = NoteBeats[random.Next(NoteBeats.Length)] * beat;
            if (random.NextDouble() > 0.15)
                AddNote(samples, time, duration, Scale[random.Next(Scale.Length)], 0.3);
            time += duration;
        }
    }

    private static void AddKick(float[] samples, double start, double velocity)
    {
        var first = (int)(start * Rate);
        for (var index = 0; index < 0.2 * Rate && first + index < samples.Length; index++)
        {
            var time = (double)index / Rate;
            var frequency = 50 + 80 * Math.Exp(-time / 0.03);
            samples[first + index] += (float)(
                velocity * Math.Exp(-time / 0.08) * Math.Sin(2 * Math.PI * frequency * time)
            );
        }
    }

    private static void AddNoiseBurst(
        float[] samples,
        Random random,
        double start,
        double decaySeconds,
        double velocity
    )
    {
        var first = (int)(start * Rate);
        for (
            var index = 0;
            index < 4 * decaySeconds * Rate && first + index < samples.Length;
            index++
        )
            samples[first + index] += (float)(
                velocity
                * Math.Exp(-(double)index / Rate / decaySeconds)
                * (2 * random.NextDouble() - 1)
            );
    }

    private static void AddNote(
        float[] samples,
        double start,
        double duration,
        double frequency,
        double velocity
    )
    {
        var first = (int)(start * Rate);
        for (var index = 0; index < duration * Rate && first + index < samples.Length; index++)
        {
            var time = (double)index / Rate;
            var envelope = Math.Min(1, time / 0.005) * Math.Exp(-time / (0.6 * duration));
            var tone = Enumerable
                .Range(1, 4)
                .Sum(harmonic => Math.Sin(2 * Math.PI * frequency * harmonic * time) / harmonic);
            samples[first + index] += (float)(velocity * envelope * tone);
        }
    }

    private static float[] Reverberated(float[] dry)
    {
        var wet = new float[dry.Length];
        foreach (var delay in CombDelaysSeconds)
            AddComb(dry, wet, (int)(delay * Rate), 0.8f);
        foreach (var delay in AllpassDelaysSeconds)
            wet = Allpassed(wet, (int)(delay * Rate), 0.7f);
        return [.. dry.Zip(wet, (direct, room) => 0.5f * direct + 0.15f * room)];
    }

    private static void AddComb(float[] dry, float[] wet, int delay, float feedback)
    {
        var line = new float[dry.Length];
        for (var index = 0; index < dry.Length; index++)
        {
            line[index] = dry[index] + (index >= delay ? feedback * line[index - delay] : 0);
            wet[index] += line[index];
        }
    }

    private static float[] Allpassed(float[] input, int delay, float gain)
    {
        var output = new float[input.Length];
        for (var index = 0; index < input.Length; index++)
        {
            var delayedInput = index >= delay ? input[index - delay] : 0;
            var delayedOutput = index >= delay ? output[index - delay] : 0;
            output[index] = -gain * input[index] + delayedInput + gain * delayedOutput;
        }

        return output;
    }

    private static float[] LowPassed(float[] input)
    {
        var output = new float[input.Length];
        for (var index = 1; index < input.Length; index++)
            output[index] = output[index - 1] + 0.35f * (input[index] - output[index - 1]);
        return output;
    }

    private static void AddRoomNoise(float[] samples, Random random)
    {
        var murmur = 0.0;
        for (var index = 0; index < samples.Length; index++)
        {
            murmur += 0.1 * ((2 * random.NextDouble() - 1) - murmur);
            samples[index] += (float)(
                0.08 * murmur
                + 0.01 * (2 * random.NextDouble() - 1)
                + 0.01 * Math.Sin(2 * Math.PI * 50 * index / Rate)
            );
        }
    }

    private static float[] Normalised(float[] samples)
    {
        var peak = samples.Max(Math.Abs);
        return peak <= 0 ? samples : [.. samples.Select(sample => sample / peak * Headroom)];
    }
}
