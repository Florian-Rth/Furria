using Furria.Core.Club;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class ClubSeedMaterializer
{
    private static readonly DateTimeOffset DefaultPublishedAt = new(
        2020,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );

    private static readonly IReadOnlyDictionary<string, int> NothingSeeded = new Dictionary<
        string,
        int
    >(StringComparer.Ordinal);

    internal static async Task<SeededClub> InsertAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> roleIds,
        CancellationToken ct
    )
    {
        RejectWhatNoTableCanHoldYet(recorded);

        var sessions = await InsertSessionsAsync(dbContext, recorded, ct);
        var venues = await InsertVenuesAsync(dbContext, recorded, ct);
        var announcements = await InsertAnnouncementsAsync(dbContext, recorded, personIds, ct);
        var keyHoldings = await InsertKeyHoldingsAsync(dbContext, recorded, venues, personIds, ct);
        var boardOffices = await InsertBoardOfficesAsync(dbContext, recorded, roleIds, ct);
        var boardSeats = await InsertBoardSeatsAsync(
            dbContext,
            recorded,
            boardOffices,
            personIds,
            ct
        );

        return new SeededClub(
            sessions,
            venues,
            announcements,
            keyHoldings,
            boardOffices,
            boardSeats,
            NothingSeeded,
            NothingSeeded
        );
    }

    private static void RejectWhatNoTableCanHoldYet(ClubSeedBuilder recorded)
    {
        RejectIfRecorded(
            recorded.CalendarEntries,
            nameof(ClubSeedBuilder.AddCalendarEntry),
            "CA-P4 D5 (Kalender)"
        );
        RejectIfRecorded(
            recorded.AttendanceResponses,
            nameof(ClubSeedBuilder.AddAttendanceResponse),
            "CA-P4 D5 (Kalender)"
        );
    }

    private static void RejectIfRecorded(
        IReadOnlyCollection<object> arrangement,
        string builderMethod,
        string owningSlice
    )
    {
        if (arrangement.Count == 0)
            return;

        throw new NotSupportedException(
            $"{nameof(ClubSeedBuilder)}.{builderMethod} arranges rows no table can hold yet — "
                + $"{owningSlice} lands the entity, its DbSet and the matching "
                + $"{nameof(ClubSeedMaterializer)} insert block. Until it does, the arrangement "
                + "would be dropped silently and the test would pass without it."
        );
    }

    private static async Task<Dictionary<string, int>> InsertSessionsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var sessions = recorded.Sessions.ToDictionary(
            intent => intent.Alias,
            intent => new Session
            {
                StartYear = intent.StartYear,
                Number = intent.Number,
                Motto = intent.Motto,
                SignetSvg = intent.SignetSvg,
            },
            StringComparer.Ordinal
        );

        if (sessions.Count > 0)
        {
            dbContext.Sessions.AddRange(sessions.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return sessions.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertAnnouncementsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var announcements = recorded.Announcements.ToDictionary(
            intent => intent.Alias,
            intent => new Announcement
            {
                AuthorPersonId = personIds[intent.AuthorPersonAlias],
                Title = intent.Title,
                Body = intent.Body,
                PublishedAt = intent.PublishedAt ?? DefaultPublishedAt,
                ValidUntil = intent.ValidUntil,
            },
            StringComparer.Ordinal
        );

        if (announcements.Count > 0)
        {
            dbContext.Announcements.AddRange(announcements.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return announcements.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertVenuesAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var venues = recorded.Venues.ToDictionary(
            intent => intent.Alias,
            intent => new Venue { Name = intent.Name, SortOrder = intent.SortOrder },
            StringComparer.Ordinal
        );

        if (venues.Count > 0)
        {
            dbContext.Venues.AddRange(venues.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return venues.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertKeyHoldingsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> venueIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var keyHoldings = recorded.KeyHoldings.ToDictionary(
            intent => intent.Alias,
            intent => new KeyHolding
            {
                VenueId = venueIds[intent.VenueAlias],
                PersonId = personIds[intent.PersonAlias],
                SinceOn = intent.SinceOn,
                UntilOn = intent.UntilOn,
            },
            StringComparer.Ordinal
        );

        if (keyHoldings.Count > 0)
        {
            dbContext.KeyHoldings.AddRange(keyHoldings.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return keyHoldings.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertBoardOfficesAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> roleIds,
        CancellationToken ct
    )
    {
        var offices = recorded.BoardOffices.ToDictionary(
            intent => intent.Alias,
            intent => new BoardOffice
            {
                Name = intent.Name,
                SortOrder = intent.SortOrder,
                ImpliedRoleId = intent.ImpliedRoleAlias is { } roleAlias
                    ? SeedAliases.RequireId(roleIds, roleAlias, "Rolle")
                    : null,
            },
            StringComparer.Ordinal
        );

        if (offices.Count > 0)
        {
            dbContext.BoardOffices.AddRange(offices.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return offices.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertBoardSeatsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> boardOfficeIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var seats = recorded.BoardSeats.ToDictionary(
            intent => intent.Alias,
            intent => new BoardSeat
            {
                BoardOfficeId = SeedAliases.RequireId(
                    boardOfficeIds,
                    intent.BoardOfficeAlias,
                    "Vorstandsfunktion"
                ),
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                SinceOn = intent.SinceOn,
                UntilOn = intent.UntilOn,
            },
            StringComparer.Ordinal
        );

        if (seats.Count > 0)
        {
            dbContext.BoardSeats.AddRange(seats.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return seats.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }
}
