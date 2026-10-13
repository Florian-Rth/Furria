namespace Furria.Application.Operations;

public sealed record StorageTally
{
    public static readonly StorageTally Empty = new() { Bytes = 0, Files = 0 };

    public required long Bytes { get; init; }

    public required int Files { get; init; }
}
