using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal static class EntryFactsRows
{
    internal static readonly Expression<Func<CalendarEntry, EntryFactsRow>> Projection =
        entry => new EntryFactsRow(
            entry.Id,
            entry.OwnerGroupId,
            entry.ParticipatingGroups.Select(link => link.GroupId).ToList(),
            new AudienceRow(
                entry.Audience,
                entry.AudienceGroups.Select(link => link.GroupId).ToList(),
                entry.AudiencePeople.Select(link => link.PersonId).ToList()
            ),
            entry.Kind,
            entry.StartsAt,
            entry.AsksForResponse
        );
}

internal sealed record AudienceRow(
    CalendarEntryAudience Audience,
    IReadOnlyList<int> GroupIds,
    IReadOnlyList<int> PersonIds
);

internal sealed record EntryFactsRow(
    int CalendarEntryId,
    int? OwnerGroupId,
    IReadOnlyList<int> ParticipatingGroupIds,
    AudienceRow Audience,
    CalendarEntryKind Kind,
    DateTimeOffset StartsAt,
    bool AsksForResponse
)
{
    [Pure]
    public CalendarEntryFacts ToFacts() =>
        new()
        {
            OwnerGroupId = OwnerGroupId,
            ParticipatingGroupIds = ParticipatingGroupIds,
            Audience = Audience.Audience,
            AudienceGroupIds = Audience.GroupIds,
            AudiencePersonIds = Audience.PersonIds,
            Kind = Kind,
            AsksForResponse = AsksForResponse,
            StartsAt = StartsAt,
        };
}
