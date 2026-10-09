using Furria.MediaWorker.Videos;
using NetVips;

namespace Furria.Api.Tests.Media;

public static class MediaSamples
{
    private static readonly byte[] JpegHead = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46];
    private static readonly byte[] GifHead = "GIF89a"u8.ToArray();
    private static readonly byte[] Mp4Head =
    [
        0x00,
        0x00,
        0x00,
        0x18,
        .. "ftypisom"u8,
        0x00,
        0x00,
        0x02,
        0x00,
        .. "isomiso2"u8,
    ];

    public static byte[] Jpeg(int length) => Filled(JpegHead, length);

    public static byte[] Mp4(int length) => Filled(Mp4Head, length);

    public static byte[] Gif(int length) => Filled(GifHead, length);

    public static byte[] Sample(string fileName) =>
        File.ReadAllBytes(Path.Combine(AppContext.BaseDirectory, "Media", "Samples", fileName));

    public static byte[] JpegOfSize(int width, int height)
    {
        using var image = Image.Black(width, height, bands: 3);
        return image.WriteToBuffer(".jpg");
    }

    public static async Task<byte[]> VideoAsync(
        IReadOnlyList<string> ffmpegArguments,
        string extension,
        CancellationToken ct
    )
    {
        var path = Path.Combine(Path.GetTempPath(), $"furria-sample-{Guid.NewGuid():N}{extension}");
        try
        {
            await MediaTool.RunAsync(
                "ffmpeg",
                ["-hide_banner", "-loglevel", "error", "-y", .. ffmpegArguments, path],
                ct
            );
            return await File.ReadAllBytesAsync(path, ct);
        }
        finally
        {
            File.Delete(path);
        }
    }

    public static async Task<byte[]> RotatedAsync(byte[] video, int degrees, CancellationToken ct)
    {
        var source = Path.Combine(Path.GetTempPath(), $"furria-sample-{Guid.NewGuid():N}.mp4");
        await File.WriteAllBytesAsync(source, video, ct);
        try
        {
            return await VideoAsync(
                ["-display_rotation", $"{degrees}", "-i", source, "-c", "copy"],
                ".mp4",
                ct
            );
        }
        finally
        {
            File.Delete(source);
        }
    }

    private static byte[] Filled(byte[] head, int length)
    {
        var content = new byte[length];
        Random.Shared.NextBytes(content);
        head.CopyTo(content, 0);
        return content;
    }
}
