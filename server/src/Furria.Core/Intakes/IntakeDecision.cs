using System.Diagnostics.Contracts;

namespace Furria.Core.Intakes;

public sealed record IntakeDecision(DateOnly? MemberFrom, IReadOnlySet<int> GroupIds)
{
    public bool HasAffiliation => MemberFrom is not null || GroupIds.Count > 0;

    [Pure]
    public static IntakeDecision Of(DateOnly? memberFrom, IEnumerable<int> groupIds) =>
        new(memberFrom, groupIds.ToHashSet());
}
