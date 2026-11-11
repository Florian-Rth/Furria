namespace Furria.Application.GroupMatcher;

public sealed record PoolStatementSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required DateTimeOffset AddedAt { get; init; }

    public required DateTimeOffset? RewordedAt { get; init; }
}
