using System.Diagnostics.Contracts;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Furria.MediaWorker.Sound;

public static class SoundProbeReport
{
    private const string AudioStream = "audio";

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    [Pure]
    public static ProbedSound? FactsOf(string ffprobeJson)
    {
        if (ReportOf(ffprobeJson) is not { } report)
            return null;

        var audio = report.Streams?.FirstOrDefault(stream => stream.CodecType == AudioStream);
        return audio is { SampleRate: > 0 }
            ? new ProbedSound(audio.SampleRate.Value, report.Format?.Duration ?? audio.Duration)
            : null;
    }

    [Pure]
    private static Report? ReportOf(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Report>(json, Json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private sealed record Report(IReadOnlyList<ProbedStream>? Streams, Format? Format);

    private sealed record ProbedStream(string? CodecType, int? SampleRate, double? Duration);

    private sealed record Format(double? Duration);
}
