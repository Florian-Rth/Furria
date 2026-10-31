namespace Furria.Application.Studio;

public sealed record PlaceActVideoCommand
{
    public required int ActId { get; init; }

    public required int VideoId { get; init; }

    public required double StartSeconds { get; init; }
}
