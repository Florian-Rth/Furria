namespace Furria.Application.Start;

public sealed record StartPoll
{
    public required int PollId { get; init; }

    public required int Position { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required bool IsOwed { get; init; }

    public required IReadOnlyList<StartPollOption> Options { get; init; }
}
