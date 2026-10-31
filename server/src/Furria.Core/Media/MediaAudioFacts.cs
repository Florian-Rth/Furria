namespace Furria.Core.Media;

public sealed class MediaAudioFacts
{
    public int SampleRate { get; set; }

    public double LoudnessLufs { get; set; }

    public double TruePeakDbtp { get; set; }

    public double LeadingSilenceSeconds { get; set; }

    public double? FirstBeatSeconds { get; set; }

    public double? TempoBpm { get; set; }
}
