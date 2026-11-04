namespace Furria.Application.Studio;

public sealed record SplitActVideoCommand
{
    public required int ActId { get; init; }

    public required int VideoId { get; init; }

    public required double AtSeconds { get; init; }
}
