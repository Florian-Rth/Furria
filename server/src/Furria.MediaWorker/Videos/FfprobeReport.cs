using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.MediaWorker.Renditions;

namespace Furria.MediaWorker.Videos;

public static class FfprobeReport
{
    private const string VideoStream = "video";
    private const string AudioStream = "audio";
    private const string AppleCreationDate = "com.apple.quicktime.creationdate";
    private const string AppleMake = "com.apple.quicktime.make";
    private const string AppleModel = "com.apple.quicktime.model";
    private const string CreationTime = "creation_time";
    private const string RotateTag = "rotate";
    private const int RightAngle = 90;
    private const int EarliestPlausibleYear = 1990;

    private static readonly IReadOnlyDictionary<string, string> NoTags =
        new Dictionary<string, string>();

    private static readonly HashSet<string> HdrTransfers = ["arib-std-b67", "smpte2084"];

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    [Pure]
    public static VideoFacts? FactsOf(string ffprobeJson)
    {
        var report = JsonSerializer.Deserialize<Report>(ffprobeJson, Json);
        var video = report?.Streams?.FirstOrDefault(stream => stream.CodecType == VideoStream);
        if (report is null || video is not { CodecName: { } codec, Width: > 0, Height: > 0 })
            return null;

        var audio = report.Streams!.FirstOrDefault(stream => stream.CodecType == AudioStream);
        var tags = report.Format?.Tags ?? NoTags;
        var turned = Math.Abs(RotationOf(video)) % (2 * RightAngle) == RightAngle;
        return new VideoFacts
        {
            Width = turned ? video.Height!.Value : video.Width!.Value,
            Height = turned ? video.Width!.Value : video.Height!.Value,
            VideoCodec = codec,
            PixelFormat = video.PixFmt,
            IsHdr = video.ColorTransfer is { } transfer && HdrTransfers.Contains(transfer),
            AudioCodec = audio?.CodecName,
            DurationSeconds = report.Format?.Duration ?? video.Duration,
            CapturedAt = CapturedAtOf(tags),
            Camera = CameraName.Of(
                tags.GetValueOrDefault(AppleMake),
                tags.GetValueOrDefault(AppleModel)
            ),
        };
    }

    [Pure]
    private static int RotationOf(ProbedStream video) =>
        video.SideDataList?.FirstOrDefault(data => data.Rotation is not null)?.Rotation
        ?? (
            video.Tags?.GetValueOrDefault(RotateTag) is { } rotate
            && int.TryParse(rotate, CultureInfo.InvariantCulture, out var degrees)
                ? degrees
                : 0
        );

    [Pure]
    private static DateTimeOffset? CapturedAtOf(IReadOnlyDictionary<string, string> tags) =>
        new[] { tags.GetValueOrDefault(AppleCreationDate), tags.GetValueOrDefault(CreationTime) }
            .Select(PlausibleInstantOf)
            .FirstOrDefault(instant => instant is not null);

    [Pure]
    private static DateTimeOffset? PlausibleInstantOf(string? text) =>
        DateTimeOffset.TryParse(
            text,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal,
            out var instant
        )
        && instant.Year >= EarliestPlausibleYear
            ? instant.ToUniversalTime()
            : null;

    private sealed record Report(IReadOnlyList<ProbedStream>? Streams, Format? Format);

    private sealed record ProbedStream(
        string? CodecType,
        string? CodecName,
        int? Width,
        int? Height,
        string? PixFmt,
        string? ColorTransfer,
        double? Duration,
        IReadOnlyDictionary<string, string>? Tags,
        IReadOnlyList<SideData>? SideDataList
    );

    private sealed record SideData(int? Rotation);

    private sealed record Format(double? Duration, IReadOnlyDictionary<string, string>? Tags);
}
