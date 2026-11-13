using Furria.Core.Club;
using Furria.Core.Events;

namespace Furria.Tests.Common.Builder;

public sealed class ClubSeedBuilder
{
    private const string DefaultStreet = "Schulstraße 4";
    private const string DefaultZip = "99713";
    private const string DefaultCity = "Großfurra";
    private const int DefaultPollPosition = 9;
    private const int DefaultSignUpListPosition = 19;
    private const int DefaultDaySchedulePosition = 29;
    private const string DefaultTeaser = "Der Abend, auf den die Session hinfiebert.";

    private static readonly DateOnly DefaultSinceOn = new(2020, 11, 11);

    private readonly List<SessionIntent> _sessions = [];
    private readonly List<VenueIntent> _venues = [];
    private readonly List<VenueOpeningSlotIntent> _venueOpeningSlots = [];
    private readonly List<AnnouncementIntent> _announcements = [];
    private readonly List<KeyHoldingIntent> _keyHoldings = [];
    private readonly List<BoardOfficeIntent> _boardOffices = [];
    private readonly List<BoardSeatIntent> _boardSeats = [];
    private readonly List<UsualTrainingTimeIntent> _usualTrainingTimes = [];
    private readonly List<CalendarEntryIntent> _calendarEntries = [];
    private readonly List<AttendanceResponseIntent> _attendanceResponses = [];
    private readonly List<CalendarPollIntent> _calendarPolls = [];
    private readonly List<CalendarPollVoteIntent> _calendarPollVotes = [];
    private readonly List<CalendarSignUpListIntent> _calendarSignUpLists = [];
    private readonly List<CalendarSignUpLineIntent> _calendarSignUpLines = [];
    private readonly List<AnnouncementLoanIntent> _announcementLoans = [];
    private readonly List<CalendarDayScheduleIntent> _calendarDaySchedules = [];
    private readonly List<CalendarDayScheduleStepIntent> _calendarDayScheduleSteps = [];
    private readonly List<EventIntent> _events = [];
    private readonly List<EventPresalePlaceIntent> _eventPresalePlaces = [];
    private ClubRecordIntent? _clubRecord;

    internal IReadOnlyList<SessionIntent> Sessions => _sessions;

    internal IReadOnlyList<VenueIntent> Venues => _venues;

    internal IReadOnlyList<VenueOpeningSlotIntent> VenueOpeningSlots => _venueOpeningSlots;

    internal IReadOnlyList<AnnouncementIntent> Announcements => _announcements;

    internal IReadOnlyList<KeyHoldingIntent> KeyHoldings => _keyHoldings;

    internal IReadOnlyList<BoardOfficeIntent> BoardOffices => _boardOffices;

    internal IReadOnlyList<BoardSeatIntent> BoardSeats => _boardSeats;

    internal IReadOnlyList<UsualTrainingTimeIntent> UsualTrainingTimes => _usualTrainingTimes;

    internal IReadOnlyList<CalendarEntryIntent> CalendarEntries => _calendarEntries;

    internal IReadOnlyList<AttendanceResponseIntent> AttendanceResponses => _attendanceResponses;

    internal IReadOnlyList<CalendarPollIntent> Polls => _calendarPolls;

    internal IReadOnlyList<CalendarPollVoteIntent> PollVotes => _calendarPollVotes;

    internal IReadOnlyList<CalendarSignUpListIntent> SignUpLists => _calendarSignUpLists;

    internal IReadOnlyList<CalendarSignUpLineIntent> SignUpLines => _calendarSignUpLines;

    internal IReadOnlyList<AnnouncementLoanIntent> AnnouncementLoans => _announcementLoans;

    internal IReadOnlyList<CalendarDayScheduleIntent> CalendarDaySchedules => _calendarDaySchedules;

    internal IReadOnlyList<CalendarDayScheduleStepIntent> CalendarDayScheduleSteps =>
        _calendarDayScheduleSteps;

    internal IReadOnlyList<EventIntent> Events => _events;

    internal IReadOnlyList<EventPresalePlaceIntent> EventPresalePlaces => _eventPresalePlaces;

    internal ClubRecordIntent? ClubRecord => _clubRecord;

    public ClubSeedBuilder SetClubRecord(
        string? name = null,
        int? foundedYear = null,
        string? street = null,
        string? zip = null,
        string? city = null,
        string? email = null,
        string? websiteUrl = null,
        int ageOfConsent = Core.Club.ClubRecord.DefaultAgeOfConsent,
        string? phone = null,
        string? instagramUrl = null,
        string? facebookUrl = null,
        ClubStageIntent? stage = null
    )
    {
        _clubRecord = new ClubRecordIntent(
            name,
            foundedYear,
            street,
            zip,
            city,
            email,
            websiteUrl,
            ageOfConsent,
            phone,
            instagramUrl,
            facebookUrl,
            stage
        );
        return this;
    }

    public ClubSeedBuilder AddSession(
        string alias,
        int startYear,
        int? number = null,
        string? motto = null
    )
    {
        _sessions.Add(new SessionIntent(alias, startYear, number, motto));
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

    public ClubSeedBuilder AddEventPresalePlace(string eventAlias, string venueAlias)
    {
        _eventPresalePlaces.Add(new EventPresalePlaceIntent(eventAlias, venueAlias));
        return this;
    }

    public ClubSeedBuilder AddVenueOpeningSlot(
        string venueAlias,
        DayOfWeek weekday,
        TimeOnly opens,
        TimeOnly closes
    )
    {
        _venueOpeningSlots.Add(new VenueOpeningSlotIntent(venueAlias, weekday, opens, closes));
        return this;
    }

    public ClubSeedBuilder AddAnnouncement(
        string alias,
        string authorPersonAlias,
        string title,
        string body,
        DateTimeOffset? publishedAt = null,
        DateOnly? validUntil = null,
        AnnouncementAttendanceIntent? attendance = null
    )
    {
        _announcements.Add(
            new AnnouncementIntent(
                alias,
                authorPersonAlias,
                title,
                body,
                publishedAt,
                validUntil,
                attendance
            )
        );
        return this;
    }

    public ClubSeedBuilder AddAnnouncementResponse(
        string alias,
        string announcementAlias,
        string personAlias,
        AttendanceAnswer answer
    )
    {
        _attendanceResponses.Add(
            new AttendanceResponseIntent(alias, null, personAlias, answer, null, announcementAlias)
        );
        return this;
    }

    public ClubSeedBuilder AddAnnouncementPoll(
        string alias,
        string announcementAlias,
        string question,
        IReadOnlyList<string> options,
        bool isAnonymous = false,
        DateTimeOffset? votesUntil = null,
        DateTimeOffset? closedAt = null,
        int position = DefaultPollPosition
    )
    {
        _calendarPolls.Add(
            new CalendarPollIntent(
                alias,
                null,
                question,
                options,
                AllowsMultipleChoices: false,
                isAnonymous,
                votesUntil,
                closedAt,
                position,
                ClosedByAlias: null,
                announcementAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddAnnouncementSignUpList(
        string alias,
        string announcementAlias,
        string title,
        DateTimeOffset? signUpUntil = null,
        DateTimeOffset? closedAt = null,
        int position = DefaultSignUpListPosition
    )
    {
        _calendarSignUpLists.Add(
            new CalendarSignUpListIntent(
                alias,
                null,
                title,
                Hint: null,
                signUpUntil,
                closedAt,
                position,
                ClosedByAlias: null,
                announcementAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddAnnouncementLoan(
        string announcementAlias,
        string calendarEntryAlias,
        AnnouncementAddOnKind kind,
        string? addOnAlias,
        int position
    )
    {
        _announcementLoans.Add(
            new AnnouncementLoanIntent(
                announcementAlias,
                calendarEntryAlias,
                kind,
                addOnAlias,
                position
            )
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
        DateOnly? archivedOn = null,
        bool isPublic = false,
        ClubIcon? icon = null
    )
    {
        _boardOffices.Add(
            new BoardOfficeIntent(
                alias,
                name,
                sortOrder,
                impliedRoleAlias,
                archivedOn,
                isPublic,
                icon
            )
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

    public ClubSeedBuilder AddUsualTrainingTime(
        string alias,
        string groupAlias,
        DayOfWeek weekday,
        TimeOnly startsAt,
        int durationMinutes,
        string? venueAlias = null
    )
    {
        _usualTrainingTimes.Add(
            new UsualTrainingTimeIntent(
                alias,
                groupAlias,
                weekday,
                startsAt,
                durationMinutes,
                venueAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarEntry(
        string alias,
        string title,
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt = null,
        CalendarEntryKind kind = CalendarEntryKind.Plain,
        CalendarEntryAudience? audience = null,
        string? venueAlias = null,
        string? ownerGroupAlias = null,
        bool asksForResponse = false,
        string? description = null,
        IReadOnlyList<string>? participatingGroupAliases = null,
        IReadOnlyList<string>? audienceGroupAliases = null,
        IReadOnlyList<string>? audiencePersonAliases = null
    )
    {
        var participating = participatingGroupAliases ?? [];
        var resolvedAudience =
            audience
            ?? (
                audiencePersonAliases is not null ? CalendarEntryAudience.People
                : ownerGroupAlias is not null || audienceGroupAliases is not null
                    ? CalendarEntryAudience.Groups
                : CalendarEntryAudience.Club
            );
        IReadOnlyList<string> audienceGroups =
            resolvedAudience != CalendarEntryAudience.Groups
                ? []
                : audienceGroupAliases
                    ??
                    [
                        .. new[] { ownerGroupAlias }
                            .OfType<string>()
                            .Concat(participating)
                            .Distinct(),
                    ];

        _calendarEntries.Add(
            new CalendarEntryIntent(
                alias,
                title,
                startsAt,
                endsAt,
                kind,
                new AudienceIntent(resolvedAudience, audienceGroups, audiencePersonAliases ?? []),
                venueAlias,
                ownerGroupAlias,
                AddOnsOf(asksForResponse, participating),
                description,
                participating
            )
        );
        return this;
    }

    private static IReadOnlyList<CalendarEntryAddOnKind> AddOnsOf(
        bool asksForResponse,
        IReadOnlyList<string> participatingGroupAliases
    ) =>
        [
            .. asksForResponse
                ? [CalendarEntryAddOnKind.Attendance]
                : Array.Empty<CalendarEntryAddOnKind>(),
            .. participatingGroupAliases.Count > 0
                ? [CalendarEntryAddOnKind.ParticipatingGroups]
                : Array.Empty<CalendarEntryAddOnKind>(),
        ];

    public ClubSeedBuilder AddAttendanceResponse(
        string alias,
        string calendarEntryAlias,
        string personAlias,
        AttendanceAnswer answer,
        string? recordedByAlias = null
    )
    {
        _attendanceResponses.Add(
            new AttendanceResponseIntent(
                alias,
                calendarEntryAlias,
                personAlias,
                answer,
                recordedByAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarPoll(
        string alias,
        string calendarEntryAlias,
        string question,
        IReadOnlyList<string> options,
        bool allowsMultipleChoices = false,
        bool isAnonymous = false,
        DateTimeOffset? votesUntil = null,
        DateTimeOffset? closedAt = null,
        int position = DefaultPollPosition,
        string? closedByAlias = null
    )
    {
        _calendarPolls.Add(
            new CalendarPollIntent(
                alias,
                calendarEntryAlias,
                question,
                options,
                allowsMultipleChoices,
                isAnonymous,
                votesUntil,
                closedAt,
                position,
                closedByAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarPollVote(
        string pollAlias,
        string optionLabel,
        string personAlias
    )
    {
        _calendarPollVotes.Add(new CalendarPollVoteIntent(pollAlias, optionLabel, personAlias));
        return this;
    }

    public ClubSeedBuilder AddCalendarSignUpList(
        string alias,
        string calendarEntryAlias,
        string title,
        string? hint = null,
        DateTimeOffset? signUpUntil = null,
        DateTimeOffset? closedAt = null,
        int position = DefaultSignUpListPosition,
        string? closedByAlias = null
    )
    {
        _calendarSignUpLists.Add(
            new CalendarSignUpListIntent(
                alias,
                calendarEntryAlias,
                title,
                hint,
                signUpUntil,
                closedAt,
                position,
                closedByAlias
            )
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarDaySchedule(
        string alias,
        string calendarEntryAlias,
        string? title,
        int position = DefaultDaySchedulePosition
    )
    {
        _calendarDaySchedules.Add(
            new CalendarDayScheduleIntent(alias, calendarEntryAlias, title, position)
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarDayScheduleStep(
        string alias,
        string dayScheduleAlias,
        int day,
        TimeOnly time,
        string text
    )
    {
        _calendarDayScheduleSteps.Add(
            new CalendarDayScheduleStepIntent(alias, dayScheduleAlias, day, time, text)
        );
        return this;
    }

    public ClubSeedBuilder AddCalendarSignUpLine(
        string alias,
        string signUpListAlias,
        string personAlias,
        string? text = null
    )
    {
        _calendarSignUpLines.Add(
            new CalendarSignUpLineIntent(alias, signUpListAlias, personAlias, text)
        );
        return this;
    }

    public ClubSeedBuilder AddEvent(
        string alias,
        string title,
        DateTimeOffset startsAt,
        string venueAlias,
        string teaser = DefaultTeaser,
        DateTimeOffset? endsAt = null,
        TimeOnly? doorsOpenAt = null,
        string? description = null,
        string? ageHint = null,
        int? priceCents = null,
        DateTimeOffset? presaleStartsAt = null,
        TicketAvailability ticketAvailability = TicketAvailability.Available,
        DateTimeOffset? cancelledAt = null,
        bool unpublished = false
    )
    {
        _events.Add(
            new EventIntent(
                alias,
                title,
                startsAt,
                venueAlias,
                teaser,
                endsAt,
                doorsOpenAt,
                description,
                ageHint,
                priceCents,
                presaleStartsAt,
                ticketAvailability,
                cancelledAt,
                unpublished
            )
        );
        return this;
    }

    internal sealed record SessionIntent(string Alias, int StartYear, int? Number, string? Motto);

    internal sealed record ClubRecordIntent(
        string? Name,
        int? FoundedYear,
        string? Street,
        string? Zip,
        string? City,
        string? Email,
        string? WebsiteUrl,
        int AgeOfConsent,
        string? Phone,
        string? InstagramUrl,
        string? FacebookUrl,
        ClubStageIntent? Stage
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

    internal sealed record EventPresalePlaceIntent(string EventAlias, string VenueAlias);

    internal sealed record VenueOpeningSlotIntent(
        string VenueAlias,
        DayOfWeek Weekday,
        TimeOnly Opens,
        TimeOnly Closes
    );

    internal sealed record AnnouncementIntent(
        string Alias,
        string AuthorPersonAlias,
        string Title,
        string Body,
        DateTimeOffset? PublishedAt,
        DateOnly? ValidUntil,
        AnnouncementAttendanceIntent? Attendance
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
        DateOnly? ArchivedOn,
        bool IsPublic,
        ClubIcon? Icon
    );

    internal sealed record BoardSeatIntent(
        string Alias,
        string BoardOfficeAlias,
        string PersonAlias,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );

    internal sealed record UsualTrainingTimeIntent(
        string Alias,
        string GroupAlias,
        DayOfWeek Weekday,
        TimeOnly StartsAt,
        int DurationMinutes,
        string? VenueAlias
    );

    internal sealed record CalendarEntryIntent(
        string Alias,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        CalendarEntryKind Kind,
        AudienceIntent Audience,
        string? VenueAlias,
        string? OwnerGroupAlias,
        IReadOnlyList<CalendarEntryAddOnKind> AddOns,
        string? Description,
        IReadOnlyList<string> ParticipatingGroupAliases
    );

    internal sealed record AudienceIntent(
        CalendarEntryAudience Audience,
        IReadOnlyList<string> GroupAliases,
        IReadOnlyList<string> PersonAliases
    );

    internal sealed record AttendanceResponseIntent(
        string Alias,
        string? CalendarEntryAlias,
        string PersonAlias,
        AttendanceAnswer Answer,
        string? RecordedByAlias,
        string? AnnouncementAlias = null
    );

    internal sealed record CalendarPollIntent(
        string Alias,
        string? CalendarEntryAlias,
        string Question,
        IReadOnlyList<string> Options,
        bool AllowsMultipleChoices,
        bool IsAnonymous,
        DateTimeOffset? VotesUntil,
        DateTimeOffset? ClosedAt,
        int Position,
        string? ClosedByAlias,
        string? AnnouncementAlias = null
    );

    internal sealed record CalendarPollVoteIntent(
        string PollAlias,
        string OptionLabel,
        string PersonAlias
    );

    internal sealed record CalendarSignUpListIntent(
        string Alias,
        string? CalendarEntryAlias,
        string Title,
        string? Hint,
        DateTimeOffset? SignUpUntil,
        DateTimeOffset? ClosedAt,
        int Position,
        string? ClosedByAlias,
        string? AnnouncementAlias = null
    );

    internal sealed record AnnouncementLoanIntent(
        string AnnouncementAlias,
        string CalendarEntryAlias,
        AnnouncementAddOnKind Kind,
        string? AddOnAlias,
        int Position
    );

    internal sealed record CalendarDayScheduleIntent(
        string Alias,
        string CalendarEntryAlias,
        string? Title,
        int Position
    );

    internal sealed record CalendarDayScheduleStepIntent(
        string Alias,
        string DayScheduleAlias,
        int Day,
        TimeOnly Time,
        string Text
    );

    internal sealed record CalendarSignUpLineIntent(
        string Alias,
        string SignUpListAlias,
        string PersonAlias,
        string? Text
    );

    internal sealed record EventIntent(
        string Alias,
        string Title,
        DateTimeOffset StartsAt,
        string VenueAlias,
        string Teaser,
        DateTimeOffset? EndsAt,
        TimeOnly? DoorsOpenAt,
        string? Description,
        string? AgeHint,
        int? PriceCents,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt,
        bool Unpublished
    );
}
