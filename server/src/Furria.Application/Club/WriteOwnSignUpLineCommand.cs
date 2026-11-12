using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record WriteOwnSignUpLineCommand
{
    public required int ActorAccountId { get; init; }

    public required AddOnHostKind Host { get; init; }

    public required int SignUpListId { get; init; }

    public required string? Text { get; init; }
}
