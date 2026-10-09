using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public static class AlbumLinks
{
    public static async Task KeepSessionOfAlbumsOnAsync(
        this AppDbContext dbContext,
        CalendarEntry entry,
        CancellationToken ct
    )
    {
        var sessionStartYear = AlbumSession.YearOf(entry.StartsAt, null);
        foreach (
            var album in await dbContext
                .Albums.Where(album => album.CalendarEntryId == entry.Id)
                .ToListAsync(ct)
        )
        {
            album.CalendarEntryId = null;
            album.SessionStartYear = sessionStartYear;
        }
    }
}
