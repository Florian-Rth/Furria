using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record PublicAdmissionAgesSummary
{
    public required int GroupId { get; init; }

    public required IReadOnlyList<AdmissionAgeBand> Bands { get; init; }
}
