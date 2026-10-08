using Furria.Core.Media;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class MediaSnifferTests
{
    public static TheoryData<string, byte[], string> AcceptedMedia =>
        new()
        {
            { "JPEG", [0xFF, 0xD8, 0xFF, 0xE1, 0x00, 0x10], "image/jpeg" },
            { "PNG", [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], "image/png" },
            { "WebP", [.. "RIFF"u8, 0x24, 0x00, 0x00, 0x00, .. "WEBPVP8 "u8], "image/webp" },
            { "iPhone HEIC", FileTypeBox("heic", "mif1", "heic"), "image/heic" },
            { "HEIF", FileTypeBox("mif1", "mif1", "heic"), "image/heif" },
            { "MP4", FileTypeBox("isom", "isom", "iso2", "avc1", "mp41"), "video/mp4" },
            { "Android MP4", FileTypeBox("mp42", "isom", "mp42"), "video/mp4" },
            { "iPhone MOV", FileTypeBox("qt  ", "qt  "), "video/quicktime" },
            {
                "old QuickTime",
                [0x00, 0x00, 0x00, 0x08, .. "wide"u8, 0, 0, 0, 0, .. "mdat"u8],
                "video/quicktime"
            },
        };

    public static TheoryData<string, byte[]> RefusedFiles =>
        new()
        {
            { "GIF", [.. "GIF89a"u8, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] },
            { "Canon CR3 RAW", FileTypeBox("crx ", "crx ", "isom") },
            { "AVIF", FileTypeBox("avif", "avif", "mif1", "miaf") },
            { "AVIF under a HEIF brand", FileTypeBox("mif1", "avif", "mif1") },
            {
                "TIFF-based RAW",
                [
                    .. "II*\0"u8,
                    0x08,
                    0x00,
                    0x00,
                    0x00,
                    0x10,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                ]
            },
            { "PDF", [.. "%PDF-1.7\n%"u8, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, 0x0A] },
            { "too short to tell", [0x00, 0x00] },
        };

    [Theory]
    [MemberData(nameof(AcceptedMedia))]
    public void Should_RecogniseTheMedia_When_ItsHeadIsAnAcceptedFormat(
        string _,
        byte[] head,
        string contentType
    )
    {
        Assert.Equal(contentType, MediaSniffer.Sniff(head)?.ContentType);
    }

    [Theory]
    [MemberData(nameof(RefusedFiles))]
    public void Should_RecogniseNothing_When_TheFileIsNoAcceptedMedia(string _, byte[] head)
    {
        Assert.Null(MediaSniffer.Sniff(head));
    }

    private static byte[] FileTypeBox(string majorBrand, params string[] compatibleBrands)
    {
        var size = 16 + 4 * compatibleBrands.Length;
        return
        [
            0x00,
            0x00,
            0x00,
            (byte)size,
            .. "ftyp"u8,
            .. System.Text.Encoding.ASCII.GetBytes(majorBrand),
            0x00,
            0x00,
            0x00,
            0x00,
            .. compatibleBrands.SelectMany(System.Text.Encoding.ASCII.GetBytes),
        ];
    }
}
