using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record TakeStanceCommand
{
    public required int GroupId { get; init; }

    public required int StatementId { get; init; }

    public required StancePosition Position { get; init; }

    public required int Importance { get; init; }
}
