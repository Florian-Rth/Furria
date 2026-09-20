using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private const int HubCalendarEntryCount = 3;

    private async Task<IReadOnlyList<ClubHubCalendarEntry>> CalendarAsync(
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.OwnerGroupId == null)
            .Where(entry =>
                entry.EndsAt == null ? entry.StartsAt > openEndedCutoff : entry.EndsAt > now
            )
            .OrderByDescending(entry => entry.StartsAt <= now)
            .ThenBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Take(HubCalendarEntryCount)
            .Select(entry => new HubCalendarRow(
                entry.Id,
                entry.Title,
                entry.StartsAt,
                entry.EndsAt,
                entry.Kind,
                entry.Venue!.Name,
                entry.StartsAt <= now
            ))
            .ToListAsync(ct);

        return [.. rows.Select(ToHubCalendarEntry)];
    }

    [Pure]
    private static ClubHubCalendarEntry ToHubCalendarEntry(HubCalendarRow row) =>
        new()
        {
            CalendarEntryId = row.CalendarEntryId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            Kind = row.Kind,
            VenueName = row.VenueName,
            IsRunning = row.IsRunning,
        };

    private sealed record HubCalendarRow(
        int CalendarEntryId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        CalendarEntryKind Kind,
        string? VenueName,
        bool IsRunning
    );
}
