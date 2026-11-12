using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record PublicStanceSummary
{
    public required int GroupId { get; init; }

    public required StancePosition Position { get; init; }

    public required int Importance { get; init; }
}
