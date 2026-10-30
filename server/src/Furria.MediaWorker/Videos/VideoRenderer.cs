using Furria.Core.Media;
using Furria.MediaWorker.Photos;
using Furria.MediaWorker.Renditions;
using Furria.MediaWorker.Sound;
using Microsoft.Extensions.Options;
using NetVips;

namespace Furria.MediaWorker.Videos;

public sealed class VideoRenderer
{
    private readonly MediaWorkerOptions _options;
    private readonly SoundAnalyser _analyser;

    public VideoRenderer(IOptions<MediaWorkerOptions> options, SoundAnalyser analyser)
    {
        _options = options.Value;
        _analyser = analyser;
    }

    public async Task<RenderedMedia> RenderAsync(
        RenditionFiles files,
        VideoKeeping keeping,
        CancellationToken ct
    )
    {
        var facts = await ProbeAsync(files.OriginalPath, ct);
        if (keeping.SoundProfile && facts.AudioCodec is not null)
            await _analyser.KeepSoundtrackProfileAsync(files, ct);
        var video = await EncodeAsync(files, facts, MediaRendition.Video, VideoBox.Full, ct);
        await RenderPosterAsync(files, video, facts.DurationSeconds, ct);
        files.Publish(video, MediaRendition.Video);
        if (keeping.Compact)
            files.Publish(
                await EncodeAsync(files, facts, MediaRendition.Compact, VideoBox.Compact, ct),
                MediaRendition.Compact
            );

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
        var report = await MediaTool.ProbeAsync(_options.FfprobePath, path, ct);
        return FfprobeReport.FactsOf(report)
            ?? throw new MediaRenderingException("The video has no picture stream");
    }

    private async Task<string> EncodeAsync(
        RenditionFiles files,
        VideoFacts facts,
        MediaRendition rendition,
        VideoBox box,
        CancellationToken ct
    )
    {
        var output = files.ScratchFileFor(rendition, ".mp4");
        await MediaTool.RunAsync(
            _options.FfmpegPath,
            VideoEncoding.ArgumentsFor(
                facts,
                files.OriginalPath,
                output,
                _options.HardwareAcceleration,
                _options.HardwareDevice,
                box
            ),
            ct
        );
        return output;
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
