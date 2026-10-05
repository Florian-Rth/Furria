namespace Furria.Application.Start;

public sealed record StartRun
{
    public required int GroupId { get; init; }

    public required string? Function { get; init; }
}
