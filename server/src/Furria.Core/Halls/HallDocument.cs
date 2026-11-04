namespace Furria.Core.Halls;

public sealed record HallDocument
{
    public static readonly HallDocument Empty = new() { Elements = [] };

    public required IReadOnlyList<HallElement> Elements { get; init; }
}
