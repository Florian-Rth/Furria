using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed record CalendarTies
{
    public required bool HoldsRunningMembership { get; init; }

    public required IReadOnlyList<SessionSpan> Pauses { get; init; }

    public required IReadOnlySet<int> MemberGroupIds { get; init; }

    public required IReadOnlyDictionary<int, string?> AdminFunctions { get; init; }

    [Pure]
    public bool IsTiedTo(CalendarEntryFacts entry) =>
        (entry.OwnerGroupId is { } owner && IsTiedToGroup(owner))
        || entry.ParticipatingGroupIds.Any(IsTiedToGroup);

    [Pure]
    public bool Concerns(CalendarEntryFacts entry) =>
        entry.OwnerGroupId is { } owner
            ? MemberGroupIds.Contains(owner)
                || entry.ParticipatingGroupIds.Any(MemberGroupIds.Contains)
            : HoldsRunningMembership && !Pauses.Any(pause => pause.Contains(entry.SessionYear));

    [Pure]
    public int? RunsVia(CalendarEntryFacts entry) =>
        entry.OwnerGroupId is { } owner && AdminFunctions.ContainsKey(owner)
            ? owner
            : entry
                .ParticipatingGroupIds.Where(AdminFunctions.ContainsKey)
                .Order()
                .Cast<int?>()
                .FirstOrDefault();

    [Pure]
    public bool IsExpectedAt(CalendarEntryFacts entry) =>
        entry.OwnerGroupId is null && entry.ParticipatingGroupIds.Any(MemberGroupIds.Contains);

    [Pure]
    public bool IsHers(CalendarEntryFacts entry) =>
        Concerns(entry) || RunsVia(entry) is not null || IsExpectedAt(entry);

    [Pure]
    public bool Sees(CalendarEntryFacts entry, bool holdsClubRead) =>
        (holdsClubRead || IsTiedTo(entry))
        && (entry.Visibility != CalendarEntryVisibility.Group || IsTiedTo(entry));

    [Pure]
    private bool IsTiedToGroup(int groupId) =>
        MemberGroupIds.Contains(groupId) || AdminFunctions.ContainsKey(groupId);
}
