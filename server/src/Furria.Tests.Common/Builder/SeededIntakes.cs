namespace Furria.Tests.Common.Builder;

public sealed record SeededIntakes(
    IReadOnlyDictionary<string, int> IntakeIds,
    IReadOnlyDictionary<string, string> LinkTokens
);
