using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Media;

namespace Furria.MediaWorker.Videos;

public static class VideoEncoding
{
    private const string PlayableVideoCodec = "h264";
    private const string PlayableAudioCodec = "aac";
    private const string Crf = "23";
    private const string AudioBitrate = "160k";
    private const string HardwareDevice = "gpu";
    private const string ToneMapToSdr =
        "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
        + "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv";
    private const double LatestPosterSecond = 1;

    private static readonly HashSet<string> PlayablePixelFormats = ["yuv420p", "yuvj420p"];

    private static readonly string[] Quiet =
    [
        "-hide_banner",
        "-nostdin",
        "-loglevel",
        "error",
        "-y",
    ];

    private static readonly string[] StreamsWithoutMetadata =
    [
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-dn",
        "-sn",
    ];

    private static readonly string[] Mp4WithFastStart = ["-movflags", "+faststart", "-f", "mp4"];

    [Pure]
    public static bool KeepsVideoStream(VideoFacts facts) =>
        facts.VideoCodec == PlayableVideoCodec
        && facts.PixelFormat is { } pixelFormat
        && PlayablePixelFormats.Contains(pixelFormat)
        && !facts.IsHdr
        && TargetSizeOf(facts.Width, facts.Height) == (facts.Width, facts.Height);

    [Pure]
    public static (int Width, int Height) TargetSizeOf(int width, int height)
    {
        var (boxWidth, boxHeight) =
            width >= height
                ? (MediaRenditions.VideoLongEdge, MediaRenditions.VideoShortEdge)
                : (MediaRenditions.VideoShortEdge, MediaRenditions.VideoLongEdge);
        var scale = Math.Min(1, Math.Min((double)boxWidth / width, (double)boxHeight / height));
        return scale >= 1 && width % 2 == 0 && height % 2 == 0
            ? (width, height)
            : (Even(width * scale), Even(height * scale));
    }

    [Pure]
    public static IReadOnlyList<string> ArgumentsFor(
        VideoFacts facts,
        string input,
        string output,
        HardwareAcceleration acceleration,
        string device
    )
    {
        var keepsVideo = KeepsVideoStream(facts);
        return
        [
            .. Quiet,
            .. keepsVideo ? [] : HardwareSetupOf(acceleration, device),
            "-i",
            input,
            .. StreamsWithoutMetadata,
            .. keepsVideo ? ["-c:v", "copy"] : VideoEncoderOf(facts, acceleration),
            .. facts.AudioCodec == PlayableAudioCodec
                ? ["-c:a", "copy"]
                : (string[])["-c:a", "aac", "-b:a", AudioBitrate, "-ac", "2"],
            .. Mp4WithFastStart,
            output,
        ];
    }

    [Pure]
    public static IReadOnlyList<string> PosterArgumentsFor(
        string video,
        double? durationSeconds,
        string poster
    ) =>
        [
            .. Quiet,
            "-ss",
            PosterSecondOf(durationSeconds).ToString("0.###", CultureInfo.InvariantCulture),
            "-i",
            video,
            "-frames:v",
            "1",
            "-update",
            "1",
            "-f",
            "image2",
            "-c:v",
            "png",
            poster,
        ];

    [Pure]
    private static string[] HardwareSetupOf(HardwareAcceleration acceleration, string device) =>
        acceleration switch
        {
            HardwareAcceleration.Vaapi =>
            [
                "-init_hw_device",
                $"vaapi={HardwareDevice}:{device}",
                "-filter_hw_device",
                HardwareDevice,
            ],
            HardwareAcceleration.Qsv =>
            [
                "-init_hw_device",
                $"vaapi=va:{device}",
                "-init_hw_device",
                $"qsv={HardwareDevice}@va",
                "-filter_hw_device",
                HardwareDevice,
            ],
            _ => [],
        };

    [Pure]
    private static string[] VideoEncoderOf(VideoFacts facts, HardwareAcceleration acceleration) =>
        ["-vf", FiltersOf(facts, acceleration), .. EncoderOf(acceleration)];

    [Pure]
    private static string FiltersOf(VideoFacts facts, HardwareAcceleration acceleration)
    {
        var (width, height) = TargetSizeOf(facts.Width, facts.Height);
        string[] chain =
        [
            $"scale={width}:{height}:flags=lanczos",
            .. facts.IsHdr ? [ToneMapToSdr] : Array.Empty<string>(),
            acceleration switch
            {
                HardwareAcceleration.Vaapi => "format=nv12,hwupload",
                HardwareAcceleration.Qsv => "format=nv12,hwupload=extra_hw_frames=64",
                _ => "format=yuv420p",
            },
        ];
        return string.Join(',', chain);
    }

    [Pure]
    private static string[] EncoderOf(HardwareAcceleration acceleration) =>
        acceleration switch
        {
            HardwareAcceleration.Vaapi => ["-c:v", "h264_vaapi", "-qp", Crf, "-profile:v", "high"],
            HardwareAcceleration.Qsv =>
            [
                "-c:v",
                "h264_qsv",
                "-global_quality",
                Crf,
                "-preset",
                "medium",
                "-profile:v",
                "high",
            ],
            _ => ["-c:v", "libx264", "-preset", "medium", "-crf", Crf, "-profile:v", "high"],
        };

    [Pure]
    private static double PosterSecondOf(double? durationSeconds) =>
        durationSeconds is > 0 ? Math.Min(LatestPosterSecond, durationSeconds.Value / 2) : 0;

    [Pure]
    private static int Even(double extent) => Math.Max(2, (int)Math.Round(extent) / 2 * 2);
}
