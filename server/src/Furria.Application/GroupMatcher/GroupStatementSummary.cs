using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record GroupStatementSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required StancePosition? Position { get; init; }

    public required int? Importance { get; init; }

    public required GroupStatementState State { get; init; }
}
