namespace Furria.Tests.Common.Builder;

internal sealed record AddOnHostSeedIds(
    IReadOnlyDictionary<string, int> CalendarEntryIds,
    IReadOnlyDictionary<string, int> AnnouncementIds
)
{
    public int? CalendarEntryIdOf(string? calendarEntryAlias) =>
        calendarEntryAlias is null
            ? null
            : SeedAliases.RequireId(CalendarEntryIds, calendarEntryAlias, "CalendarEntry");

    public int? AnnouncementIdOf(string? announcementAlias) =>
        announcementAlias is null
            ? null
            : SeedAliases.RequireId(AnnouncementIds, announcementAlias, "Announcement");
}
