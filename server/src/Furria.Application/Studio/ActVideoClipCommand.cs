namespace Furria.Application.Studio;

public sealed record ActVideoClipCommand
{
    public required int ActId { get; init; }

    public required int VideoId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}
