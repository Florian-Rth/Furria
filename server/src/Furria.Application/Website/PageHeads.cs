using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.RegularExpressions;
using Furria.Application.Events;
using Furria.Application.Gallery;
using Furria.Application.News;
using Furria.Core.Club;
using Furria.Core.Website;

namespace Furria.Application.Website;

public static partial class PageHeads
{
    private const string TitleSuffix = "FCC Großfurra";

    private static readonly string[] GermanMonths =
    [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ];

    [Pure]
    public static PageHead Of(PublicEventDetails shown) =>
        new()
        {
            Title = TitleOf($"{shown.Title} {YearsLabelAt(shown.StartsAt)}"),
            Description = shown.Teaser,
            CanonicalPath = WebsiteAddress.EventPathOf(shown.EventId, shown.Title),
            Kind = PageHeadKind.Website,
            ImagePath = shown.Picture?.Picture.LargeUrl,
            ImageAlt = shown.Title,
            PublishedAt = null,
        };

    [Pure]
    public static PageHead Of(PublicNewsDetails shown) =>
        new()
        {
            Title = TitleOf(shown.Title),
            Description = shown.Teaser,
            CanonicalPath = WebsiteAddress.NewsPathOf(shown.Slug),
            Kind = PageHeadKind.Article,
            ImagePath = shown.Picture?.LargeUrl,
            ImageAlt = shown.Title,
            PublishedAt = shown.PublishedAt,
        };

    [Pure]
    public static PageHead Of(PublicAlbumDetails shown) =>
        new()
        {
            Title = TitleOf($"{shown.Title} {ClubSession.LabelOf(shown.SessionStartYear)}"),
            Description = DescriptionOf(shown),
            CanonicalPath = WebsiteAddress.AlbumPathOf(shown.AlbumId, shown.Title),
            Kind = PageHeadKind.Website,
            ImagePath = shown.Photos.FirstOrDefault()?.Picture.LargeUrl,
            ImageAlt = shown.Title,
            PublishedAt = null,
        };

    [Pure]
    private static string TitleOf(string name) => $"{name} · {TitleSuffix}";

    [Pure]
    private static string YearsLabelAt(DateTimeOffset instant) =>
        ClubSession.LabelOf(ClubSession.YearOf(ClubClock.DayOf(instant)));

    [Pure]
    private static string DescriptionOf(PublicAlbumDetails album) =>
        FirstParagraphOf(album.Description)
        ?? $"{PhotoCountOf(album.Photos.Count)}: {album.Title}, {MomentOf(album)}.";

    [Pure]
    private static string? FirstParagraphOf(string? text) =>
        ParagraphBreak()
            .Split(text ?? "")
            .Select(paragraph => paragraph.Trim())
            .FirstOrDefault(paragraph => paragraph.Length > 0);

    [Pure]
    private static string PhotoCountOf(int count) => count == 1 ? "1 Foto" : $"{count} Fotos";

    [Pure]
    private static string MomentOf(PublicAlbumDetails album) =>
        album.EntryStartsAt is { } startsAt
            ? $"{LongDateOf(ClubClock.DayOf(startsAt))} · {SessionLabelOf(album)}"
            : SessionLabelOf(album);

    [Pure]
    private static string SessionLabelOf(PublicAlbumDetails album) =>
        album.SessionNumber is { } number
            ? $"{number}. Session {ClubSession.LabelOf(album.SessionStartYear)}"
            : $"Session {ClubSession.LabelOf(album.SessionStartYear)}";

    [Pure]
    private static string LongDateOf(DateOnly day) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{day.Day}. {GermanMonths[day.Month - 1]} {day.Year}"
        );

    [GeneratedRegex(@"\n\s*\n", RegexOptions.CultureInvariant)]
    private static partial Regex ParagraphBreak();
}
