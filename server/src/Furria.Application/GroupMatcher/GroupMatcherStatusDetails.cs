namespace Furria.Application.GroupMatcher;

public sealed record GroupMatcherStatusDetails
{
    public required bool IsTakingPart { get; init; }

    public required int OpenStatements { get; init; }
}
