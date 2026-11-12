namespace Furria.Application.GroupMatcher;

public sealed record CoverageCell
{
    public required int StatementId { get; init; }

    public required GroupStatementState State { get; init; }
}
