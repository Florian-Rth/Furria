namespace Furria.Tests.Common.Builder;

// Resolves a string alias to the value the builder materialized for it. An unknown alias throws
// with the full list of declared aliases, recovering most of the typo safety the MET007 analyzer
// targets without breaking the one-lambda flow.
public sealed class AliasRegistry<TValue>
{
    private readonly string _kind;
    private readonly IReadOnlyDictionary<string, TValue> _map;

    public AliasRegistry(string kind, IReadOnlyDictionary<string, TValue> map)
    {
        _kind = kind;
        _map = map;
    }

    public IReadOnlyCollection<string> Aliases => _map.Keys.ToList();

    public TValue Resolve(string alias)
    {
        if (_map.TryGetValue(alias, out var value))
            return value;

        var declared = _map.Count == 0 ? "(none)" : string.Join(", ", _map.Keys);
        throw new KeyNotFoundException(
            $"Unknown {_kind} alias \"{alias}\". Declared {_kind} aliases: {declared}."
        );
    }
}
