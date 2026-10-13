namespace Furria.Application.Operations;

public sealed record DatabaseTableSummary
{
    public required string Name { get; init; }

    public required long SizeBytes { get; init; }

    public required long RowEstimate { get; init; }
}
