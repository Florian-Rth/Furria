using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantFacts
{
    private const string DateFormat = "yyyy-MM-dd";
    private const string TimeFormat = "HH:mm";
    private const string WholeClub = "ganzer Verein";
    private const string ChosenPeople = "ausgewählte Personen";

    private static readonly IReadOnlyDictionary<DayOfWeek, string> Weekdays = new Dictionary<
        DayOfWeek,
        string
    >
    {
        [DayOfWeek.Monday] = "Montag",
        [DayOfWeek.Tuesday] = "Dienstag",
        [DayOfWeek.Wednesday] = "Mittwoch",
        [DayOfWeek.Thursday] = "Donnerstag",
        [DayOfWeek.Friday] = "Freitag",
        [DayOfWeek.Saturday] = "Samstag",
        [DayOfWeek.Sunday] = "Sonntag",
    };

    [Pure]
    public static ClubBasicsFact BasicsOf(PublicClubDetails club, DateTimeOffset now) =>
        new(club.Name, club.FoundedYear, club.Session.Label, club.Session.Motto, MomentOf(now));

    [Pure]
    public static CalendarEntryFact EntryOf(CalendarEntrySummary entry, string appUrl) =>
        new(
            entry.Title,
            KindOf(entry.Kind),
            MomentOf(entry.StartsAt),
            entry.EndsAt is { } endsAt ? MomentOf(endsAt) : null,
            entry.VenueName,
            entry.OwnerGroupName ?? WholeClub,
            AudienceOf(entry),
            entry.IsRunning,
            WhatsAppHostLinks.CalendarEntryOf(appUrl, entry.CalendarEntryId)
        );

    [Pure]
    public static UsualTrainingFact UsualTrainingOf(UsualTrainingSummary training) =>
        new(
            training.GroupName,
            MomentOf(training.StartsAt),
            TimeOf(ClubClock.TimeOf(training.EndsAt)),
            (int)(training.EndsAt - training.StartsAt).TotalMinutes,
            training.VenueName
        );

    [Pure]
    public static ClubMomentFact MomentOf(DateTimeOffset instant)
    {
        var wallClock = ClubClock.WallClockOf(instant);
        return new ClubMomentFact(
            wallClock.ToString(DateFormat, CultureInfo.InvariantCulture),
            WeekdayOf(wallClock.DayOfWeek),
            wallClock.ToString(TimeFormat, CultureInfo.InvariantCulture)
        );
    }

    [Pure]
    public static string WeekdayOf(DayOfWeek weekday) => Weekdays[weekday];

    [Pure]
    public static string TimeOf(TimeOnly time) =>
        time.ToString(TimeFormat, CultureInfo.InvariantCulture);

    [Pure]
    public static string DayOf(DateOnly day) =>
        day.ToString(DateFormat, CultureInfo.InvariantCulture);

    [Pure]
    public static string AddressOf(string street, string zip, string city) =>
        $"{street}, {zip} {city}";

    [Pure]
    public static IReadOnlyList<OpeningHoursFact> OpeningHoursOf(
        IReadOnlyList<VenueOpeningSlotDetails> slots
    ) =>
        [
            .. slots.Select(slot => new OpeningHoursFact(
                WeekdayOf(slot.Weekday),
                TimeOf(slot.Opens),
                TimeOf(slot.Closes)
            )),
        ];

    [Pure]
    private static string KindOf(CalendarEntryKind kind) =>
        kind switch
        {
            CalendarEntryKind.Plain => "Termin",
            CalendarEntryKind.Training => "Training",
            CalendarEntryKind.Trip => "Ausflug",
            CalendarEntryKind.Event => "Veranstaltung",
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };

    [Pure]
    private static string AudienceOf(CalendarEntrySummary entry) =>
        entry.Audience switch
        {
            CalendarEntryAudience.Groups when entry.AudienceGroups.Count > 0 => string.Join(
                ", ",
                entry.AudienceGroups.Select(group => group.Name)
            ),
            CalendarEntryAudience.People => ChosenPeople,
            _ => WholeClub,
        };
}
