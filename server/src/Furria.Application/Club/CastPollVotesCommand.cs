namespace Furria.Application.Club;

public sealed record CastPollVotesCommand
{
    public required int ActorAccountId { get; init; }

    public required int PollId { get; init; }

    public required IReadOnlyList<int> OptionIds { get; init; }
}
