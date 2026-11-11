namespace Furria.Application.Club;

public sealed record WriteOwnCalendarSignUpLineCommand
{
    public required int ActorAccountId { get; init; }

    public required int SignUpListId { get; init; }

    public required string? Text { get; init; }
}
