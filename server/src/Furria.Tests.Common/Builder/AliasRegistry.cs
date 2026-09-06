namespace Furria.Tests.Common.Builder;

public sealed class AliasRegistry<TValue>
{
    private readonly string _kind;
    private readonly IReadOnlyDictionary<string, TValue> _map;

    public AliasRegistry(string kind, IReadOnlyDictionary<string, TValue> map)
    {
        _kind = kind;
        _map = map;
    }

    public TValue IdOf(string alias)
    {
        if (_map.TryGetValue(alias, out var value))
            return value;

        var declared = _map.Count == 0 ? "(none)" : string.Join(", ", _map.Keys);
        throw new KeyNotFoundException(
            $"Unknown {_kind} alias \"{alias}\". Declared {_kind} aliases: {declared}."
        );
    }
}
