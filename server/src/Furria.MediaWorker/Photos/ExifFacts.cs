using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.RegularExpressions;
using Furria.Core.Club;
using Furria.MediaWorker.Renditions;

namespace Furria.MediaWorker.Photos;

public sealed partial record ExifFacts(DateTimeOffset? CapturedAt, string? Camera)
{
    public const string CaptureTimeField = "exif-ifd2-DateTimeOriginal";
    public const string CaptureOffsetField = "exif-ifd2-OffsetTimeOriginal";
    public const string MakeField = "exif-ifd0-Make";
    public const string ModelField = "exif-ifd0-Model";

    private const string CaptureTimeFormat = "yyyy:MM:dd HH:mm:ss";
    private const string OffsetFormat = "zzz";

    [Pure]
    public static ExifFacts Of(Func<string, string?> field) =>
        new(
            CaptureTimeOf(TextOf(field(CaptureTimeField)), TextOf(field(CaptureOffsetField))),
            CameraName.Of(TextOf(field(MakeField)), TextOf(field(ModelField)))
        );

    [Pure]
    private static DateTimeOffset? CaptureTimeOf(string? wallClock, string? offset)
    {
        if (
            !DateTime.TryParseExact(
                wallClock,
                CaptureTimeFormat,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var captured
            )
        )
            return null;

        return OffsetOf(offset) is { } known
            ? new DateTimeOffset(captured, known).ToUniversalTime()
            : ClubClock.At(DateOnly.FromDateTime(captured), TimeOnly.FromDateTime(captured));
    }

    [Pure]
    private static TimeSpan? OffsetOf(string? offset) =>
        DateTimeOffset.TryParseExact(
            offset,
            OffsetFormat,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var parsed
        )
            ? parsed.Offset
            : null;

    [Pure]
    private static string? TextOf(string? field)
    {
        if (field is null)
            return null;

        var match = VipsExifText().Match(field);
        var text = (match.Success ? match.Groups["value"].Value : field).Trim().TrimEnd('\0');
        return text.Length > 0 ? text : null;
    }

    [GeneratedRegex(@"^(?<value>.*) \(\k<value>, ", RegexOptions.Singleline)]
    private static partial Regex VipsExifText();
}
