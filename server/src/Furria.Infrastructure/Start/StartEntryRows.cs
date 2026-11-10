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
            new StartAudienceRow(
                entry.Audience,
                entry
                    .AudienceGroups.OrderBy(link =>
                        EF.Functions.Collate(link.Group!.Name, GermanCollation.Name)
                    )
                    .ThenBy(link => link.GroupId)
                    .Select(link => new StartGroupRow(
                        link.GroupId,
                        link.Group!.Name,
                        link.Group!.Tone
                    ))
                    .ToList(),
                entry.AudiencePeople.Select(link => link.PersonId).ToList()
            ),
            entry.AsksForResponse,
            entry.Description,
            entry.Event == null
                ? null
                : new StartEventRow(
                    entry.Event.CancelledAt != null,
                    entry.Event.PictureId,
                    entry.Event.Picture == null ? null : entry.Event.Picture.RenderedAt
                )
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
    StartAudienceRow Audience,
    bool AsksForResponse,
    string? Description,
    StartEventRow? Event
)
{
    [Pure]
    public CalendarEntryFacts ToFacts() =>
        new()
        {
            OwnerGroupId = OwnerGroup?.GroupId,
            ParticipatingGroupIds = [.. ParticipatingGroups.Select(group => group.GroupId)],
            Audience = Audience.Audience,
            AudienceGroupIds = [.. Audience.Groups.Select(group => group.GroupId)],
            AudiencePersonIds = Audience.PersonIds,
            Kind = Kind,
            AsksForResponse = AsksForResponse,
            StartsAt = StartsAt,
        };

    [Pure]
    public IEnumerable<int> GroupIds() =>
        new[] { OwnerGroup }
            .Concat(ParticipatingGroups)
            .Concat(Audience.Groups)
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

internal sealed record StartEventRow(
    bool IsCancelled,
    int? PictureId,
    DateTimeOffset? PictureRenderedAt
);

internal sealed record StartGroupRow(int GroupId, string Name, GroupTone? Tone);

internal sealed record StartAudienceRow(
    CalendarEntryAudience Audience,
    IReadOnlyList<StartGroupRow> Groups,
    IReadOnlyList<int> PersonIds
);
