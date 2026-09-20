using Furria.Core.Club;
using Furria.Core.Groups;
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

    internal static async Task<SeededClub> InsertAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> roleIds,
        CancellationToken ct
    )
    {
        var sessions = await InsertSessionsAsync(dbContext, recorded, ct);
        var venues = await InsertVenuesAsync(dbContext, recorded, ct);
        var trainingSlots = await InsertTrainingSlotsAsync(
            dbContext,
            recorded,
            groupIds,
            venues,
            ct
        );
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
        var calendarEntries = await InsertCalendarEntriesAsync(
            dbContext,
            recorded,
            venues,
            groupIds,
            ct
        );
        var attendanceResponses = await InsertAttendanceResponsesAsync(
            dbContext,
            recorded,
            calendarEntries,
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
            trainingSlots,
            calendarEntries,
            attendanceResponses
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
                LogoSvg = intent.LogoSvg,
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
            intent => new Venue
            {
                Name = intent.Name,
                Street = intent.Street,
                Zip = intent.Zip,
                City = intent.City,
                Hint = intent.Hint,
                SortOrder = intent.SortOrder,
                ArchivedOn = intent.ArchivedOn,
            },
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

    private static async Task<Dictionary<string, int>> InsertTrainingSlotsAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> venueIds,
        CancellationToken ct
    )
    {
        var slots = recorded.TrainingSlots.ToDictionary(
            intent => intent.Alias,
            intent => new GroupTrainingSlot
            {
                GroupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, "Gruppe"),
                VenueId = intent.VenueAlias is null
                    ? null
                    : SeedAliases.RequireId(venueIds, intent.VenueAlias, "Ort"),
                Weekday = intent.Weekday,
                StartsAt = intent.StartsAt,
                DurationMinutes = intent.DurationMinutes,
            },
            StringComparer.Ordinal
        );

        if (slots.Count > 0)
        {
            dbContext.GroupTrainingSlots.AddRange(slots.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return slots.ToDictionary(
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
                ArchivedOn = intent.ArchivedOn,
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

    private static async Task<Dictionary<string, int>> InsertCalendarEntriesAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> venueIds,
        IReadOnlyDictionary<string, int> groupIds,
        CancellationToken ct
    )
    {
        var entries = recorded.CalendarEntries.ToDictionary(
            intent => intent.Alias,
            intent => new CalendarEntry
            {
                Title = intent.Title,
                Description = intent.Description,
                StartsAt = intent.StartsAt,
                EndsAt = intent.EndsAt,
                Kind = intent.Kind,
                Visibility = intent.Visibility,
                AsksForResponse = intent.AsksForResponse,
                VenueId = intent.VenueAlias is null
                    ? null
                    : SeedAliases.RequireId(venueIds, intent.VenueAlias, "Ort"),
                OwnerGroupId = intent.OwnerGroupAlias is null
                    ? null
                    : SeedAliases.RequireId(groupIds, intent.OwnerGroupAlias, "Gruppe"),
            },
            StringComparer.Ordinal
        );

        if (entries.Count > 0)
        {
            dbContext.CalendarEntries.AddRange(entries.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return entries.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertAttendanceResponsesAsync(
        AppDbContext dbContext,
        ClubSeedBuilder recorded,
        IReadOnlyDictionary<string, int> calendarEntryIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var responses = recorded.AttendanceResponses.ToDictionary(
            intent => intent.Alias,
            intent => new AttendanceResponse
            {
                CalendarEntryId = SeedAliases.RequireId(
                    calendarEntryIds,
                    intent.CalendarEntryAlias,
                    "Kalendereintrag"
                ),
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                Answer = intent.Answer,
            },
            StringComparer.Ordinal
        );

        if (responses.Count > 0)
        {
            dbContext.AttendanceResponses.AddRange(responses.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return responses.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }
}
