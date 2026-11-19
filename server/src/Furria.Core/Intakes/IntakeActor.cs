using System.Diagnostics.Contracts;

namespace Furria.Core.Intakes;

public sealed record IntakeActor(
    int? PersonId,
    bool ManagesPersons,
    IReadOnlySet<int> AdministeredGroupIds
)
{
    public bool MayRunIntakes => ManagesPersons || AdministeredGroupIds.Count > 0;

    [Pure]
    public bool MayDecide(IntakeDecision decision) =>
        ManagesPersons
        || (decision.MemberFrom is null && decision.GroupIds.All(AdministeredGroupIds.Contains));

    [Pure]
    public bool MayRedecide(IntakeDecision current, IntakeDecision changed) =>
        ManagesPersons
        || (
            changed.MemberFrom == current.MemberFrom
            && ForeignGroupsOf(changed).SetEquals(ForeignGroupsOf(current))
        );

    [Pure]
    public bool Manages(int? startedByPersonId) =>
        ManagesPersons || (PersonId is { } personId && startedByPersonId == personId);

    [Pure]
    private HashSet<int> ForeignGroupsOf(IntakeDecision decision) =>
        [.. decision.GroupIds.Where(groupId => !AdministeredGroupIds.Contains(groupId))];
}
