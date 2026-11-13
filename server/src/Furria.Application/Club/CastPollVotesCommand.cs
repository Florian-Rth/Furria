using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CastPollVotesCommand
{
    public required int ActorAccountId { get; init; }

    public required AddOnHostKind Host { get; init; }

    public required int PollId { get; init; }

    public required IReadOnlyList<int> OptionIds { get; init; }
}
