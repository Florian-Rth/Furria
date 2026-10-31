namespace Furria.Application.Studio;

public sealed record ActVideoCommand
{
    public required int ActId { get; init; }

    public required int VideoId { get; init; }
}
