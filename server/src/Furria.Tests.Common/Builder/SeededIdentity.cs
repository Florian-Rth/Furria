namespace Furria.Tests.Common.Builder;

public sealed record SeededIdentity(
    IReadOnlyDictionary<string, int> PersonIds,
    IReadOnlyDictionary<string, int> MembershipIds,
    IReadOnlyDictionary<string, int> PauseIds,
    IReadOnlyDictionary<string, int> FeeReductionIds,
    IReadOnlyDictionary<string, int> AccountIds,
    IReadOnlyDictionary<string, string> AccountEmails
);
