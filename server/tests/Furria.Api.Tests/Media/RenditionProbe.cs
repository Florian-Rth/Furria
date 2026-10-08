using Furria.MediaWorker;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.Options;
using NetVips;

namespace Furria.Api.Tests.Media;

public static class RenditionProbe
{
    public static (int Width, int Height) SizeOf(string imagePath)
    {
        using var image = Image.NewFromFile(imagePath);
        return (image.Width, image.Height);
    }

    public static bool CarriesMetadata(string imagePath)
    {
        using var image = Image.NewFromFile(imagePath);
        return image.GetFields().Any(field => field.StartsWith("exif-", StringComparison.Ordinal));
    }

    public static async Task<string> ContainerTagsOf(string videoPath, CancellationToken ct) =>
        await MediaTool.RunAsync(
            "ffprobe",
            ["-v", "error", "-show_entries", "format_tags", "-of", "json", videoPath],
            ct
        );

    public static async Task<bool> StartsFastAsync(string videoPath, CancellationToken ct)
    {
        var bytes = await File.ReadAllBytesAsync(videoPath, ct);
        var movie = bytes.AsSpan().IndexOf("moov"u8);
        var media = bytes.AsSpan().IndexOf("mdat"u8);
        return movie >= 0 && movie < media;
    }

    public static Task<VideoFacts> VideoFactsOf(string videoPath, CancellationToken ct) =>
        new VideoRenderer(Options.Create(new MediaWorkerOptions())).ProbeAsync(videoPath, ct);
}
