namespace Furria.Application.Start;

public sealed record StartSignUpList
{
    public required int SignUpListId { get; init; }

    public required int Position { get; init; }

    public required string Title { get; init; }

    public required string? Hint { get; init; }

    public required bool IsOwed { get; init; }

    public required string? ViewerText { get; init; }
}
