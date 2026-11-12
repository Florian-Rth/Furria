namespace Furria.Application.GroupMatcher;

public sealed record PublicStatementSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required IReadOnlyList<PublicStanceSummary> Stances { get; init; }
}
