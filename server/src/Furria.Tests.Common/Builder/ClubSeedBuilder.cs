using Furria.Core.Club;

namespace Furria.Tests.Common.Builder;

public sealed class ClubSeedBuilder
{
    private const string DefaultStreet = "Schulstraße 4";
    private const string DefaultZip = "99713";
    private const string DefaultCity = "Großfurra";

    private static readonly DateOnly DefaultSinceOn = new(2020, 11, 11);

    private readonly List<SessionIntent> _sessions = [];
    private readonly List<VenueIntent> _venues = [];
    private readonly List<AnnouncementIntent> _announcements = [];
    private readonly List<KeyHoldingIntent> _keyHoldings = [];
    private readonly List<BoardOfficeIntent> _boardOffices = [];
    private readonly List<BoardSeatIntent> _boardSeats = [];
    private readonly List<CalendarEntryIntent> _calendarEntries = [];
    private readonly List<AttendanceResponseIntent> _attendanceResponses = [];

    internal IReadOnlyList<SessionIntent> Sessions => _sessions;

    internal IReadOnlyList<VenueIntent> Venues => _venues;

    internal IReadOnlyList<AnnouncementIntent> Announcements => _announcements;

    internal IReadOnlyList<KeyHoldingIntent> KeyHoldings => _keyHoldings;

    internal IReadOnlyList<BoardOfficeIntent> BoardOffices => _boardOffices;

    internal IReadOnlyList<BoardSeatIntent> BoardSeats => _boardSeats;

    internal IReadOnlyList<CalendarEntryIntent> CalendarEntries => _calendarEntries;

    internal IReadOnlyList<AttendanceResponseIntent> AttendanceResponses => _attendanceResponses;

    public ClubSeedBuilder AddSession(
        string alias,
        int startYear,
        int? number = null,
        string? motto = null,
        string? logoSvg = null
    )
    {
        _sessions.Add(new SessionIntent(alias, startYear, number, motto, logoSvg));
        return this;
    }

    public ClubSeedBuilder AddVenue(
        string alias,
        string name,
        int sortOrder = 1,
        string street = DefaultStreet,
        string zip = DefaultZip,
        string city = DefaultCity,
        string? hint = null,
        DateOnly? archivedOn = null
    )
    {
        _venues.Add(new VenueIntent(alias, name, sortOrder, street, zip, city, hint, archivedOn));
        return this;
    }

    public ClubSeedBuilder AddAnnouncement(
        string alias,
        string authorPersonAlias,
        string title,
        string body,
        DateTimeOffset? publishedAt = null,
        DateOnly? validUntil = null
    )
    {
        _announcements.Add(
            new AnnouncementIntent(alias, authorPersonAlias, title, body, publishedAt, validUntil)
        );
        return this;
    }

    public ClubSeedBuilder AddKeyHolding(
        string alias,
        string venueAlias,
        string personAlias,
        DateOnly? sinceOn = null,
        DateOnly? untilOn = null
    )
    {
        _keyHoldings.Add(
            new KeyHoldingIntent(alias, venueAlias, personAlias, sinceOn ?? DefaultSinceOn, untilOn)
        );
        return this;
    }

    public ClubSeedBuilder AddBoardOffice(
        string alias,
        string name,
        int sortOrder = 1,
        string? impliedRoleAlias = null,
        DateOnly? archivedOn = null
    )
    {
        _boardOffices.Add(
            new BoardOfficeIntent(alias, name, sortOrder, impliedRoleAlias, archivedOn)
        );
        return this;
    }

    public ClubSeedBuilder AddBoardSeat(
        string alias,
        string boardOfficeAlias,
        string personAlias,
        DateOnly? sinceOn = null,
        DateOnly? untilOn = null
    )
    {
        _boardSeats.Add(
            new BoardSeatIntent(
                alias,
                boardOfficeAlias,
                personAlias,
                sinceOn ?? DefaultSinceOn,
                untilOn
            )
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarEntry(
        string alias,
        string title,
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt = null,
        CalendarEntryKind kind = CalendarEntryKind.Meeting,
        CalendarEntryVisibility visibility = CalendarEntryVisibility.Club,
        string? venueAlias = null,
        string? ownerGroupAlias = null,
        bool asksForResponse = false,
        string? description = null
    )
    {
        _calendarEntries.Add(
            new CalendarEntryIntent(
                alias,
                title,
                startsAt,
                endsAt,
                kind,
                visibility,
                venueAlias,
                ownerGroupAlias,
                asksForResponse,
                description
            )
        );
        return this;
    }

    public ClubSeedBuilder AddAttendanceResponse(
        string alias,
        string calendarEntryAlias,
        string personAlias,
        AttendanceAnswer answer
    )
    {
        _attendanceResponses.Add(
            new AttendanceResponseIntent(alias, calendarEntryAlias, personAlias, answer)
        );
        return this;
    }

    internal sealed record SessionIntent(
        string Alias,
        int StartYear,
        int? Number,
        string? Motto,
        string? LogoSvg
    );

    internal sealed record VenueIntent(
        string Alias,
        string Name,
        int SortOrder,
        string Street,
        string Zip,
        string City,
        string? Hint,
        DateOnly? ArchivedOn
    );

    internal sealed record AnnouncementIntent(
        string Alias,
        string AuthorPersonAlias,
        string Title,
        string Body,
        DateTimeOffset? PublishedAt,
        DateOnly? ValidUntil
    );

    internal sealed record KeyHoldingIntent(
        string Alias,
        string VenueAlias,
        string PersonAlias,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );

    internal sealed record BoardOfficeIntent(
        string Alias,
        string Name,
        int SortOrder,
        string? ImpliedRoleAlias,
        DateOnly? ArchivedOn
    );

    internal sealed record BoardSeatIntent(
        string Alias,
        string BoardOfficeAlias,
        string PersonAlias,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );

    internal sealed record CalendarEntryIntent(
        string Alias,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        CalendarEntryKind Kind,
        CalendarEntryVisibility Visibility,
        string? VenueAlias,
        string? OwnerGroupAlias,
        bool AsksForResponse,
        string? Description
    );

    internal sealed record AttendanceResponseIntent(
        string Alias,
        string CalendarEntryAlias,
        string PersonAlias,
        AttendanceAnswer Answer
    );
}
