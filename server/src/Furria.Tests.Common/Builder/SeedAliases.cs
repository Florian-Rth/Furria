namespace Furria.Tests.Common.Builder;

internal static class SeedAliases
{
    internal static int RequireId(
        IReadOnlyDictionary<string, int> ids,
        string alias,
        string kind
    ) =>
        ids.TryGetValue(alias, out var id)
            ? id
            : throw new KeyNotFoundException(
                $"No {kind} was seeded for alias \"{alias}\". Declared aliases: "
                    + $"{string.Join(", ", ids.Keys)}."
            );
}
