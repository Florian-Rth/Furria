using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

internal static class StartEntryRows
{
    internal static readonly Expression<Func<CalendarEntry, StartEntryRow>> Projection =
        entry => new StartEntryRow(
            entry.Id,
            entry.Title,
            entry.Kind,
            entry.StartsAt,
            entry.EndsAt,
            entry.Venue == null
                ? null
                : new StartVenueRow(
                    entry.Venue.Id,
                    entry.Venue.Name,
                    entry.Venue.Street,
                    entry.Venue.Zip,
                    entry.Venue.City,
                    entry.Venue.Hint
                ),
            entry.OwnerGroup == null
                ? null
                : new StartGroupRow(
                    entry.OwnerGroup.Id,
                    entry.OwnerGroup.Name,
                    entry.OwnerGroup.Tone
                ),
            entry
                .ParticipatingGroups.OrderBy(link =>
                    EF.Functions.Collate(link.Group!.Name, GermanCollation.Name)
                )
                .ThenBy(link => link.GroupId)
                .Select(link => new StartGroupRow(link.GroupId, link.Group!.Name, link.Group!.Tone))
                .ToList(),
            entry.Visibility,
            entry.AsksForResponse,
            entry.Description
        );
}

internal sealed record StartEntryRow(
    int CalendarEntryId,
    string Title,
    CalendarEntryKind Kind,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    StartVenueRow? Venue,
    StartGroupRow? OwnerGroup,
    IReadOnlyList<StartGroupRow> ParticipatingGroups,
    CalendarEntryVisibility Visibility,
    bool AsksForResponse,
    string? Description
)
{
    [Pure]
    public CalendarEntryFacts ToFacts() =>
        CalendarEntryFacts.Of(
            OwnerGroup?.GroupId,
            [.. ParticipatingGroups.Select(group => group.GroupId)],
            Visibility,
            StartsAt
        );

    [Pure]
    public IEnumerable<int> GroupIds() =>
        new[] { OwnerGroup }
            .Concat(ParticipatingGroups)
            .OfType<StartGroupRow>()
            .Select(group => group.GroupId);

    [Pure]
    public bool IsRunningAt(DateTimeOffset now) =>
        StartsAt <= now
        && (
            EndsAt is { } endsAt
                ? endsAt > now
                : StartsAt > now.AddHours(-CalendarDefaults.OpenEndedHours)
        );
}

internal sealed record StartVenueRow(
    int VenueId,
    string Name,
    string Street,
    string Zip,
    string City,
    string? Hint
);

internal sealed record StartGroupRow(int GroupId, string Name, GroupTone? Tone);
