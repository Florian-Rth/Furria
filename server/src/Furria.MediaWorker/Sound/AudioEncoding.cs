using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Sound;

namespace Furria.MediaWorker.Sound;

public static class AudioEncoding
{
    private const string LoudnessTarget = "I=-16:TP=-1.5:LRA=11";
    private const int HighSampleRate = 48000;
    private const int StandardSampleRate = 44100;
    private const string LongestAnalysedSeconds = "3600";

    public const string NormalisedBitrate = "256k";
    public const string PreviewBitrate = "96k";

    private static readonly string[] Quiet =
    [
        "-hide_banner",
        "-nostdin",
        "-loglevel",
        "error",
        "-y",
    ];

    private static readonly string[] FirstSoundOnly =
    [
        "-map",
        "0:a:0",
        "-vn",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
    ];

    [Pure]
    public static IReadOnlyList<string> MeasurementArgumentsFor(string input) =>
        [
            "-hide_banner",
            "-nostdin",
            "-nostats",
            "-loglevel",
            "info",
            "-i",
            input,
            .. FirstSoundOnly,
            "-af",
            $"loudnorm={LoudnessTarget}:print_format=json",
            "-f",
            "null",
            "-",
        ];

    [Pure]
    public static IReadOnlyList<string> NormalisedArgumentsFor(
        string input,
        string output,
        LoudnessMeasurement measurement,
        int sourceSampleRate,
        string bitrate
    ) =>
        [
            .. Quiet,
            "-i",
            input,
            .. FirstSoundOnly,
            .. measurement.IsSilent ? [] : (string[])["-af", LoudnessFilterOf(measurement)],
            "-ar",
            Invariant(OutputSampleRateOf(sourceSampleRate)),
            "-ac",
            "2",
            "-c:a",
            "aac",
            "-b:a",
            bitrate,
            "-movflags",
            "+faststart",
            "-f",
            "mp4",
            output,
        ];

    [Pure]
    public static IReadOnlyList<string> AnalysisArgumentsFor(string input, string output) =>
        [
            .. Quiet,
            "-i",
            input,
            .. FirstSoundOnly,
            "-t",
            LongestAnalysedSeconds,
            "-ac",
            "1",
            "-ar",
            Invariant(SoundSignal.AnalysisSampleRate),
            "-f",
            "f32le",
            output,
        ];

    [Pure]
    public static int OutputSampleRateOf(int sourceSampleRate) =>
        sourceSampleRate >= HighSampleRate ? HighSampleRate : StandardSampleRate;

    [Pure]
    private static string LoudnessFilterOf(LoudnessMeasurement measurement) =>
        $"loudnorm={LoudnessTarget}"
        + $":measured_I={Invariant(measurement.IntegratedLufs)}"
        + $":measured_TP={Invariant(measurement.TruePeakDbtp)}"
        + $":measured_LRA={Invariant(measurement.RangeLu)}"
        + $":measured_thresh={Invariant(measurement.ThresholdLufs)}"
        + $":offset={Invariant(measurement.TargetOffsetLu)}"
        + ":linear=true:print_format=none";

    [Pure]
    private static string Invariant(double value) => value.ToString(CultureInfo.InvariantCulture);
}
