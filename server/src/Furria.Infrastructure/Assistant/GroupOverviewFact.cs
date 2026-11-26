namespace Furria.Infrastructure.Assistant;

public sealed record GroupOverviewFact(int ClubMemberCount, IReadOnlyList<GroupFact> Groups);
