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
            entry.Visibility,
            entry.Kind,
            entry.StartsAt,
            entry.AsksForResponse
        );
}

internal sealed record EntryFactsRow(
    int CalendarEntryId,
    int? OwnerGroupId,
    IReadOnlyList<int> ParticipatingGroupIds,
    CalendarEntryVisibility Visibility,
    CalendarEntryKind Kind,
    DateTimeOffset StartsAt,
    bool AsksForResponse
)
{
    [Pure]
    public CalendarEntryFacts ToFacts() =>
        CalendarEntryFacts.Of(OwnerGroupId, ParticipatingGroupIds, Visibility, Kind, StartsAt);
}
