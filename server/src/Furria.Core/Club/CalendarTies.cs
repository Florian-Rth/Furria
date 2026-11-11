using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed record CalendarTies
{
    public required int? PersonId { get; init; }

    public required bool HoldsRunningMembership { get; init; }

    public required IReadOnlyList<SessionSpan> Pauses { get; init; }

    public required IReadOnlySet<int> MemberGroupIds { get; init; }

    public required IReadOnlyDictionary<int, string?> AdminFunctions { get; init; }

    public required IReadOnlySet<GroupSession> CastSessions { get; init; }

    [Pure]
    public bool IsTiedTo(CalendarEntryFacts entry) =>
        entry.IsForChosenPeople
            ? IsChosenFor(entry) || AdministersOwnerOf(entry)
            : entry.TieGroupIds().Any(IsTiedToGroup) || IsAskedAsCast(entry);

    [Pure]
    public bool Concerns(CalendarEntryFacts entry) =>
        entry.Audience switch
        {
            CalendarEntryAudience.People => IsChosenFor(entry),
            CalendarEntryAudience.Groups => IsAskedAsCast(entry)
                || entry.AudienceGroupIds.Any(MemberGroupIds.Contains),
            CalendarEntryAudience.Club => IsAskedAsCast(entry)
                || IsRunningMemberIn(entry.SessionYear),
            _ => throw new ArgumentOutOfRangeException(nameof(entry), entry.Audience, null),
        };

    [Pure]
    public bool IsAskedAsCast(CalendarEntryFacts entry) => entry.AsksTheCastOf(CastSessions);

    [Pure]
    public int? RunsVia(CalendarEntryFacts entry) =>
        entry.OwnerGroupId is { } owner && AdminFunctions.ContainsKey(owner) ? owner
        : entry.IsForChosenPeople ? null
        : entry
            .ParticipatingGroupIds.Where(AdminFunctions.ContainsKey)
            .Order()
            .Cast<int?>()
            .FirstOrDefault();

    [Pure]
    public bool IsExpectedAt(CalendarEntryFacts entry) =>
        !entry.IsForChosenPeople
        && entry.OwnerGroupId is null
        && entry.ParticipatingGroupIds.Any(MemberGroupIds.Contains);

    [Pure]
    public bool IsHers(CalendarEntryFacts entry) =>
        Concerns(entry) || RunsVia(entry) is not null || IsExpectedAt(entry);

    [Pure]
    public bool Sees(CalendarEntryFacts entry, CalendarRights rights) =>
        entry.IsForChosenPeople
            ? IsChosenFor(entry) || Schedules(entry, rights)
            : rights.HoldsClubRead || IsTiedTo(entry);

    [Pure]
    private bool Schedules(CalendarEntryFacts entry, CalendarRights rights) =>
        entry.OwnerGroupId is null ? rights.ManagesClubCalendar : AdministersOwnerOf(entry);

    [Pure]
    private bool IsChosenFor(CalendarEntryFacts entry) =>
        PersonId is { } personId && entry.AudiencePersonIds.Contains(personId);

    [Pure]
    private bool AdministersOwnerOf(CalendarEntryFacts entry) =>
        entry.OwnerGroupId is { } owner && AdminFunctions.ContainsKey(owner);

    [Pure]
    private bool IsRunningMemberIn(int sessionYear) =>
        HoldsRunningMembership && !Pauses.Any(pause => pause.Contains(sessionYear));

    [Pure]
    private bool IsTiedToGroup(int groupId) =>
        MemberGroupIds.Contains(groupId) || AdminFunctions.ContainsKey(groupId);
}
