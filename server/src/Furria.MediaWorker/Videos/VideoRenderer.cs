using Furria.Core.Media;
using Furria.MediaWorker.Photos;
using Furria.MediaWorker.Renditions;
using Microsoft.Extensions.Options;
using NetVips;

namespace Furria.MediaWorker.Videos;

public sealed class VideoRenderer
{
    private static readonly string[] ProbeArguments =
    [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
    ];

    private readonly MediaWorkerOptions _options;

    public VideoRenderer(IOptions<MediaWorkerOptions> options)
    {
        _options = options.Value;
    }

    public async Task<RenderedMedia> RenderAsync(RenditionFiles files, CancellationToken ct)
    {
        var facts = await ProbeAsync(files.OriginalPath, ct);
        var video = files.ScratchFileFor(MediaRendition.Video, ".mp4");
        await MediaTool.RunAsync(
            _options.FfmpegPath,
            VideoEncoding.ArgumentsFor(
                facts,
                files.OriginalPath,
                video,
                _options.HardwareAcceleration,
                _options.HardwareDevice
            ),
            ct
        );
        await RenderPosterAsync(files, video, facts.DurationSeconds, ct);
        files.Publish(video, MediaRendition.Video);

        return new RenderedMedia
        {
            Width = facts.Width,
            Height = facts.Height,
            DurationSeconds = facts.DurationSeconds,
            CapturedAt = facts.CapturedAt,
            Camera = facts.Camera,
        };
    }

    public async Task<VideoFacts> ProbeAsync(string path, CancellationToken ct)
    {
        var report = await MediaTool.RunAsync(_options.FfprobePath, [.. ProbeArguments, path], ct);
        return FfprobeReport.FactsOf(report)
            ?? throw new MediaRenderingException("The video has no picture stream");
    }

    private async Task RenderPosterAsync(
        RenditionFiles files,
        string video,
        double? durationSeconds,
        CancellationToken ct
    )
    {
        var frame = files.ScratchFileFor(MediaRendition.Poster, ".png");
        await MediaTool.RunAsync(
            _options.FfmpegPath,
            VideoEncoding.PosterArgumentsFor(video, durationSeconds, frame),
            ct
        );
        using var still = Image.NewFromFile(frame, failOn: Enums.FailOn.Error);
        using var display = WebPWriter.InSrgb(still);
        WebPWriter.Save(display, MediaRenditions.VideoLongEdge, files, MediaRendition.Poster);
        WebPWriter.Save(display, MediaRenditions.SmallLongEdge, files, MediaRendition.Small);
    }
}
