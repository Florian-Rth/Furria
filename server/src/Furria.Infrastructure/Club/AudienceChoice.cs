using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal sealed record AudienceChoice(
    CalendarEntryAudience Audience,
    IReadOnlyList<int> GroupIds,
    IReadOnlyList<int> PersonIds
)
{
    [Pure]
    public static AudienceChoice Of(
        CalendarEntryAudience audience,
        IReadOnlyList<int> groupIds,
        IReadOnlyList<int> personIds
    ) =>
        new(
            audience,
            audience == CalendarEntryAudience.Groups ? [.. groupIds.Distinct()] : [],
            audience == CalendarEntryAudience.People ? [.. personIds.Distinct()] : []
        );
}
