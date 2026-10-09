using System.Buffers.Binary;
using System.Diagnostics.Contracts;
using System.Text;

namespace Furria.Core.Media;

public static class MediaSniffer
{
    public const int HeadLength = 64;

    private const int BoxTypeOffset = 4;
    private const int MajorBrandOffset = 8;
    private const int CompatibleBrandsOffset = 16;
    private const int BrandLength = 4;

    private static readonly MediaFormat Jpeg = new(MediaKind.Photo, "image/jpeg");
    private static readonly MediaFormat Png = new(MediaKind.Photo, "image/png");
    private static readonly MediaFormat WebP = new(MediaKind.Photo, "image/webp");
    private static readonly MediaFormat Heic = new(MediaKind.Photo, "image/heic");
    private static readonly MediaFormat Heif = new(MediaKind.Photo, "image/heif");
    private static readonly MediaFormat Mp4 = new(MediaKind.Video, "video/mp4");
    private static readonly MediaFormat QuickTime = new(MediaKind.Video, "video/quicktime");

    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    private static readonly byte[] Riff = "RIFF"u8.ToArray();
    private static readonly byte[] WebPMarker = "WEBP"u8.ToArray();
    private static readonly byte[] FileTypeBox = "ftyp"u8.ToArray();

    private static readonly HashSet<string> HeicBrands =
    [
        "heic",
        "heix",
        "heim",
        "heis",
        "hevc",
        "hevx",
    ];

    private static readonly HashSet<string> HeifBrands = ["mif1", "msf1", "heif"];

    private static readonly HashSet<string> AvifBrands = ["avif", "avis"];

    private static readonly HashSet<string> Mp4Brands =
    [
        "isom",
        "iso2",
        "iso3",
        "iso4",
        "iso5",
        "iso6",
        "mp41",
        "mp42",
        "mp71",
        "avc1",
        "M4V ",
        "M4VH",
        "M4VP",
        "MSNV",
        "XAVC",
        "dash",
        "f4v ",
        "3gp4",
        "3gp5",
        "3gp6",
        "3g2a",
    ];

    private static readonly HashSet<string> QuickTimeBrands = ["qt  "];

    private static readonly HashSet<string> QuickTimeLeadingAtoms =
    [
        "moov",
        "mdat",
        "wide",
        "free",
        "skip",
        "pnot",
    ];

    [Pure]
    public static MediaFormat? Sniff(ReadOnlySpan<byte> head) =>
        head.StartsWith(JpegSignature) ? Jpeg
        : head.StartsWith(PngSignature) ? Png
        : IsWebP(head) ? WebP
        : IsoMediaFormatOf(head);

    [Pure]
    private static bool IsWebP(ReadOnlySpan<byte> head) =>
        head.Length >= 12 && head.StartsWith(Riff) && head.Slice(8, 4).SequenceEqual(WebPMarker);

    [Pure]
    private static MediaFormat? IsoMediaFormatOf(ReadOnlySpan<byte> head)
    {
        if (head.Length < CompatibleBrandsOffset)
            return null;

        var boxType = head.Slice(BoxTypeOffset, BrandLength);
        if (!boxType.SequenceEqual(FileTypeBox))
            return QuickTimeLeadingAtoms.Contains(Ascii(boxType)) ? QuickTime : null;

        var majorBrand = Ascii(head.Slice(MajorBrandOffset, BrandLength));
        var compatibleBrands = CompatibleBrandsOf(head);

        return majorBrand switch
        {
            _ when HeicBrands.Contains(majorBrand) => Heic,
            _ when HeifBrands.Contains(majorBrand) => compatibleBrands.Overlaps(AvifBrands)
                ? null
                : Heif,
            _ when QuickTimeBrands.Contains(majorBrand) => QuickTime,
            _ when Mp4Brands.Contains(majorBrand) => Mp4,
            _ => null,
        };
    }

    [Pure]
    private static HashSet<string> CompatibleBrandsOf(ReadOnlySpan<byte> head)
    {
        var boxSize = (int)Math.Min(BinaryPrimitives.ReadUInt32BigEndian(head), head.Length);
        var brands = new HashSet<string>(StringComparer.Ordinal);
        for (
            var offset = CompatibleBrandsOffset;
            offset + BrandLength <= boxSize;
            offset += BrandLength
        )
            brands.Add(Ascii(head.Slice(offset, BrandLength)));

        return brands;
    }

    [Pure]
    private static string Ascii(ReadOnlySpan<byte> bytes) => Encoding.ASCII.GetString(bytes);
}
