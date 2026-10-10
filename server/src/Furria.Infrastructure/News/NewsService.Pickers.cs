using System.Diagnostics.Contracts;
using Furria.Application.News;
using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Core.Groups;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    public async Task<NewsMentionables> GetMentionablesAsync(CancellationToken ct)
    {
        var groups = await _dbContext
            .Groups.AsNoTracking()
            .Where(PublicGroups.IsShown)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new GroupRow(
                group.Id,
                group.Name,
                group.Description,
                group.Tone,
                group.PictureId,
                group.Picture == null ? null : group.Picture.RenderedAt
            ))
            .ToListAsync(ct);
        var seats = await _runningBoardSeats.SeatsAsync(ClubClock.Today(_timeProvider), ct);

        return new NewsMentionables
        {
            Groups = [.. groups.Select(MentionableOf)],
            Persons = PersonsOf(seats),
        };
    }

    public async Task<NewsTieCandidates> GetTieCandidatesAsync(CancellationToken ct)
    {
        var events = await _dbContext
            .Events.AsNoTracking()
            .OrderByDescending(row => row.CalendarEntry!.StartsAt)
            .ThenByDescending(row => row.CalendarEntryId)
            .Select(row => new NewsEventTie(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.CalendarEntry.EndsAt,
                row.CalendarEntry.Venue == null ? null : row.CalendarEntry.Venue.Name,
                row.CancelledAt != null
            ))
            .ToListAsync(ct);
        var albums = await _dbContext
            .Albums.AsNoTracking()
            .Where(album => album.BinnedAt == null && album.PublishedAt != null)
            .Select(album => new AlbumRow(
                album.Id,
                album.Title,
                album.CalendarEntry == null ? null : album.CalendarEntry.StartsAt,
                album.SessionStartYear
            ))
            .ToListAsync(ct);

        var cards = await AlbumCardsAsync([.. albums.Select(album => album.AlbumId)], ct);

        return new NewsTieCandidates { Events = events, Albums = TieableOf(albums, cards) };
    }

    private MentionableGroup MentionableOf(GroupRow group) =>
        new(
            group.GroupId,
            group.Name,
            group.Description,
            group.Tone,
            _pictures.GroupPictureOf(group.GroupId, group.PictureId, group.PictureRenderedAt)
        );

    private IReadOnlyList<MentionablePerson> PersonsOf(IReadOnlyList<RunningBoardSeat> seats) =>
        [
            .. seats
                .Where(seat => seat.OfficeIsPublic)
                .DistinctBy(seat => seat.PersonId)
                .Select(seat => new MentionablePerson(
                    seat.PersonId,
                    seat.FirstName,
                    seat.LastName,
                    seat.OfficeName,
                    _pictures.PortraitOf(seat.PersonId, seat.PortraitId, seat.PortraitRenderedAt)
                )),
        ];

    [Pure]
    private static IReadOnlyList<TieableAlbum> TieableOf(
        IReadOnlyList<AlbumRow> albums,
        IReadOnlyDictionary<int, AlbumCard> cards
    ) =>
        [
            .. albums
                .Select(album => new TieableAlbum(
                    album.AlbumId,
                    album.Title,
                    AlbumSession.YearOf(album.EntryStartsAt, album.SessionStartYear),
                    cards.GetValueOrDefault(album.AlbumId)?.PhotoCount ?? 0,
                    cards.GetValueOrDefault(album.AlbumId)?.Cover
                ))
                .OrderByDescending(album => album.SessionStartYear)
                .ThenByDescending(album => album.AlbumId),
        ];

    private sealed record GroupRow(
        int GroupId,
        string Name,
        string Description,
        GroupTone? Tone,
        int? PictureId,
        DateTimeOffset? PictureRenderedAt
    );

    private sealed record AlbumRow(
        int AlbumId,
        string Title,
        DateTimeOffset? EntryStartsAt,
        int? SessionStartYear
    );
}
