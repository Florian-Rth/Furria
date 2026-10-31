using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.Json;

namespace Furria.MediaWorker.Sound;

public sealed record LoudnessMeasurement(
    double IntegratedLufs,
    double TruePeakDbtp,
    double RangeLu,
    double ThresholdLufs,
    double TargetOffsetLu
)
{
    private const double SilenceFloor = -70;
    private const string IntegratedKey = "input_i";
    private const string NegativeInfinity = "-inf";

    public static LoudnessMeasurement Silence { get; } =
        new(SilenceFloor, SilenceFloor, 0, SilenceFloor, 0);

    public bool IsSilent => this == Silence;

    [Pure]
    public static LoudnessMeasurement? Parse(string ffmpegDiagnostics)
    {
        var start = ffmpegDiagnostics.LastIndexOf('{');
        var end = ffmpegDiagnostics.LastIndexOf('}');
        if (start < 0 || end < start)
            return null;

        return ReportOf(ffmpegDiagnostics[start..(end + 1)]) is { } report
            ? MeasurementOf(report)
            : null;
    }

    [Pure]
    private static Dictionary<string, string>? ReportOf(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    [Pure]
    private static LoudnessMeasurement? MeasurementOf(IReadOnlyDictionary<string, string> report) =>
        report.GetValueOrDefault(IntegratedKey) == NegativeInfinity ? Silence
        : NumberOf(report, IntegratedKey) is { } integrated
        && NumberOf(report, "input_tp") is { } truePeak
        && NumberOf(report, "input_lra") is { } range
        && NumberOf(report, "input_thresh") is { } threshold
        && NumberOf(report, "target_offset") is { } offset
            ? new LoudnessMeasurement(integrated, truePeak, range, threshold, offset)
        : null;

    [Pure]
    private static double? NumberOf(IReadOnlyDictionary<string, string> report, string key) =>
        report.TryGetValue(key, out var text)
        && double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out var value)
        && double.IsFinite(value)
            ? value
            : null;
}
