namespace Furria.Application.Club;

public sealed record PollInput
{
    public required int? PollId { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required DateTimeOffset? VotesUntil { get; init; }

    public required IReadOnlyList<PollOptionInput> Options { get; init; }
}
