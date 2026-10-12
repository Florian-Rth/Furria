using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Furria.Core.Website;

public readonly partial record struct PictureSlotPosition
{
    public const int SlotKeyLength = 80;
    public const int FirstPosition = 1;
    public const int LastPosition = 24;
    public const string SlotKeyPattern = "^[a-z][a-zA-Z]*(\\.[a-z][a-zA-Z]*)+$";

    private const char Separator = ':';

    public string SlotKey { get; }

    public int Position { get; }

    public string Token => $"{SlotKey}{Separator}{Position}";

    public PictureSlotPosition(string slotKey, int position)
    {
        SlotKey = slotKey;
        Position = position;
    }

    [Pure]
    public static bool IsWellFormedSlotKey(string? slotKey) =>
        slotKey is { Length: > 0 and <= SlotKeyLength } && SlotKeyRegex().IsMatch(slotKey);

    [Pure]
    public static bool IsWellFormedPosition(int position) =>
        position is >= FirstPosition and <= LastPosition;

    [Pure]
    public static PictureSlotPosition? Of(string? slotKey, int position) =>
        IsWellFormedSlotKey(slotKey) && IsWellFormedPosition(position)
            ? new PictureSlotPosition(slotKey!, position)
            : null;

    [Pure]
    public static PictureSlotPosition? Parse(string? token)
    {
        var separatorAt = token?.LastIndexOf(Separator) ?? -1;
        if (separatorAt < 0)
            return null;

        return int.TryParse(
            token.AsSpan(separatorAt + 1),
            NumberStyles.None,
            CultureInfo.InvariantCulture,
            out var position
        )
            ? Of(token![..separatorAt], position)
            : null;
    }

    [GeneratedRegex(SlotKeyPattern, RegexOptions.CultureInvariant)]
    private static partial Regex SlotKeyRegex();
}
