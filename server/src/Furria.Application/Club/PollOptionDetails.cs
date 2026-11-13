namespace Furria.Application.Club;

public sealed record PollOptionDetails
{
    public required int OptionId { get; init; }

    public required string Label { get; init; }

    public required int VoteCount { get; init; }

    public required bool ViewerChose { get; init; }

    public required IReadOnlyList<PollVoter> Voters { get; init; }
}
