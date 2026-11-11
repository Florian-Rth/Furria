namespace Furria.Application.GroupMatcher;

public sealed record ApprovedStatementSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required DateTimeOffset ApprovedAt { get; init; }

    public required DateTimeOffset? RewordedAt { get; init; }
}
