namespace Furria.Tests.Common.Builder;

public sealed record SeededGroups(
    IReadOnlyDictionary<string, int> GroupKindIds,
    IReadOnlyDictionary<string, int> GroupIds,
    IReadOnlyDictionary<string, int> GroupMembershipIds,
    IReadOnlyDictionary<string, int> GroupAdminIds
);
