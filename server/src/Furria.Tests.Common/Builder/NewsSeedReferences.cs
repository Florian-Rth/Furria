using System.Text.RegularExpressions;

namespace Furria.Tests.Common.Builder;

internal sealed partial class NewsSeedReferences
{
    private const string GroupTarget = "group:";

    private readonly IReadOnlyDictionary<string, int> _personIds;
    private readonly IReadOnlyDictionary<string, int> _groupIds;
    private readonly IReadOnlyDictionary<string, int> _eventIds;
    private readonly IReadOnlyDictionary<string, int> _albumIds;

    internal NewsSeedReferences(
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> eventIds,
        IReadOnlyDictionary<string, int> albumIds
    )
    {
        _personIds = personIds;
        _groupIds = groupIds;
        _eventIds = eventIds;
        _albumIds = albumIds;
    }

    internal string Resolve(string text) =>
        AliasedTarget()
            .Replace(
                text,
                match =>
                    match.Groups["kind"].Value
                    + SeedAliases.RequireId(
                        match.Groups["kind"].Value == GroupTarget ? _groupIds : _personIds,
                        match.Groups["alias"].Value,
                        match.Groups["kind"].Value.TrimEnd(':')
                    )
            );

    internal int? PersonIdOf(string? alias) =>
        alias is null ? null : SeedAliases.RequireId(_personIds, alias, "person");

    internal int? EventIdOf(string? alias) =>
        alias is null ? null : SeedAliases.RequireId(_eventIds, alias, "event");

    internal int? AlbumIdOf(string? alias) =>
        alias is null ? null : SeedAliases.RequireId(_albumIds, alias, "album");

    [GeneratedRegex(@"(?<kind>group:|person:)\{(?<alias>[^}]+)\}")]
    private static partial Regex AliasedTarget();
}
