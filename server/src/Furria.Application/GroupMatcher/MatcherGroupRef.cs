using Furria.Core.Groups;

namespace Furria.Application.GroupMatcher;

public sealed record MatcherGroupRef
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}
