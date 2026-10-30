namespace Furria.Application.Studio;

public sealed record ActVideoNameCommand
{
    public required int ActId { get; init; }

    public required int VideoId { get; init; }

    public required string? Name { get; init; }
}
