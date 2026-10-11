using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.Groups;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Public;

public sealed class PublicFace
{
    private static readonly Expression<Func<Group, bool>> IsShownGroup = group =>
        group.ArchivedOn == null;

    private static readonly Expression<Func<Album, bool>> IsPublishedAlbum = album =>
        album.PublishedAt != null && album.BinnedAt == null;

    private static readonly Expression<Func<MediaItem, bool>> IsSelectedPhoto = item =>
        item.OwnerKind == MediaOwnerKind.Gallery
        && item.Kind == MediaKind.Photo
        && item.State == MediaItemState.Ready
        && item.BinnedAt == null
        && item.SelectionPosition != null;

    private static readonly Expression<Func<NewsPost, bool>> IsLivePost = post =>
        post.PublishedAt != null
        && post.WithdrawnAt == null
        && post.Slug != null
        && post.Category != null;

    private static readonly Expression<Func<BoardSeat, bool>> IsInAPublicOffice = seat =>
        seat.BoardOffice!.IsPublic;

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public IQueryable<Event> Events =>
        _dbContext.Events.AsNoTracking().Where(IsShownEventAt(_timeProvider.GetUtcNow()));

    public IQueryable<Group> Groups => _dbContext.Groups.AsNoTracking().Where(IsShownGroup);

    public IQueryable<Album> Albums => _dbContext.Albums.AsNoTracking().Where(IsPublishedAlbum);

    public IQueryable<MediaItem> SelectedPhotos
    {
        get
        {
            var albums = Albums;
            return _dbContext
                .MediaItems.AsNoTracking()
                .Where(IsSelectedPhoto)
                .Where(item => albums.Any(album => album.Id == item.AlbumId));
        }
    }

    public IQueryable<NewsPost> NewsPosts => _dbContext.NewsPosts.AsNoTracking().Where(IsLivePost);

    public IQueryable<BoardSeat> BoardSeats =>
        _dbContext
            .BoardSeats.AsNoTracking()
            .Where(RunningBoardSeats.RunningOn(ClubClock.Today(_timeProvider)))
            .Where(IsInAPublicOffice);

    public PublicFace(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    [Pure]
    private static Expression<Func<Event, bool>> IsShownEventAt(DateTimeOffset now)
    {
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        return row =>
            row.CalendarEntry!.Venue != null
            && (
                row.CalendarEntry.EndsAt == null
                    ? row.CalendarEntry.StartsAt > openEndedCutoff
                    : row.CalendarEntry.EndsAt > now
            );
    }
}
