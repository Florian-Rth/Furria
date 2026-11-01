using System.Text;
using Furria.Core.Media;
using tusdotnet.Interfaces;
using tusdotnet.Models;

namespace Furria.Api.Media;

public static class UploadMetadata
{
    public static string? FileNameOf(Dictionary<string, Metadata> metadata)
    {
        var fileName = Path.GetFileName(
            TextOf(metadata, MediaUploadEvents.FileNameMetadataKey)?.Trim()
        );
        return string.IsNullOrEmpty(fileName) || fileName.Length > MediaItem.OriginalFileNameLength
            ? null
            : fileName;
    }

    public static string? TextOf(Dictionary<string, Metadata> metadata, string key) =>
        metadata.TryGetValue(key, out var value) && !value.HasEmptyValue
            ? value.GetString(Encoding.UTF8)
            : null;

    public static async Task<MediaFormat> FormatOfAsync(ITusFile file, CancellationToken ct)
    {
        await using var content = await file.GetContentAsync(ct);
        return MediaSniffer.Sniff(await UploadHead.ReadHeadAsync(content, ct))
            ?? throw new InvalidOperationException(
                "A completed upload was sniffed on its first chunk and must still be media."
            );
    }
}
