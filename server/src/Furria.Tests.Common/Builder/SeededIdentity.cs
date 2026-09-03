namespace Furria.Tests.Common.Builder;

public sealed record SeededIdentity(
    IReadOnlyDictionary<string, int> PersonIds,
    IReadOnlyDictionary<string, int> AccountIds,
    IReadOnlyDictionary<string, string> AccountEmails
);
