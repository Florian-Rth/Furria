namespace Furria.Application.Media;

public sealed record MediaAudioFactsDetails
{
    public required int SampleRate { get; init; }

    public required double LoudnessLufs { get; init; }

    public required double TruePeakDbtp { get; init; }

    public required double LeadingSilenceSeconds { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}
