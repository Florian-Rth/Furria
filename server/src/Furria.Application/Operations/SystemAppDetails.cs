namespace Furria.Application.Operations;

public sealed record SystemAppDetails
{
    public required string Version { get; init; }

    public required string Environment { get; init; }

    public required DateTimeOffset StartedAt { get; init; }
}
