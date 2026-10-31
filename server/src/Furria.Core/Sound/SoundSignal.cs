namespace Furria.Core.Sound;

public sealed record SoundSignal(float[] Samples, int SampleRate)
{
    public const int AnalysisSampleRate = 16000;

    public double DurationSeconds => (double)Samples.Length / SampleRate;
}
