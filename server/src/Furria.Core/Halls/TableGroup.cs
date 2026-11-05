namespace Furria.Core.Halls;

public sealed record TableGroup
{
    public required string Id { get; init; }

    public string? Number { get; init; }

    public string? Note { get; init; }
}
