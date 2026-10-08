using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Media;

namespace Furria.MediaWorker.Jobs;

public static class RegenerationRequest
{
    public const string Verb = "regenerate";
    public const string Usage = "regenerate all | failed | <media item id> [<media item id> ...]";

    private const string AllScope = "all";
    private const string FailedScope = "failed";

    [Pure]
    public static bool IsRequested(IReadOnlyList<string> args) => args is [Verb, ..];

    [Pure]
    public static RegenerateMediaCommand? CommandOf(IReadOnlyList<string> args) =>
        args switch
        {
            [Verb, AllScope] => new() { Scope = MediaRegenerationScope.All },
            [Verb, FailedScope] => new() { Scope = MediaRegenerationScope.Failed },
            [Verb, _, ..] when ItemIdsOf(args.Skip(1)) is { } ids => new()
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = ids,
            },
            _ => null,
        };

    [Pure]
    private static IReadOnlyCollection<int>? ItemIdsOf(IEnumerable<string> arguments)
    {
        var ids = new List<int>();
        foreach (var argument in arguments)
        {
            if (
                !int.TryParse(argument, NumberStyles.None, CultureInfo.InvariantCulture, out var id)
                || id <= 0
            )
                return null;
            ids.Add(id);
        }

        return ids;
    }
}
