using System.Buffers;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;

namespace Furria.Core.Groups;

public sealed record GroupTone
{
    private const char HexPrefix = '#';

    public const int HexLength = 7;

    private static readonly SearchValues<char> HexDigits = SearchValues.Create(
        "0123456789abcdefABCDEF"
    );

    private GroupTone(string hex)
    {
        Hex = hex;
    }

    public string Hex { get; }

    [Pure]
    public static bool TryParse(string? value, [NotNullWhen(true)] out GroupTone? tone)
    {
        tone = IsHexColor(value) ? new GroupTone(value.ToUpperInvariant()) : null;
        return tone is not null;
    }

    [Pure]
    public static GroupTone Parse(string value) =>
        TryParse(value, out var tone)
            ? tone
            : throw new FormatException($"'{value}' is not a #RRGGBB color.");

    public override string ToString() => Hex;

    [Pure]
    private static bool IsHexColor([NotNullWhen(true)] string? value) =>
        value is { Length: HexLength }
        && value[0] == HexPrefix
        && !value.AsSpan(1).ContainsAnyExcept(HexDigits);
}
