namespace Furria.Application.Intakes;

public sealed record IntakeReviewDetails
{
    public required IntakeNewcomerDetails Newcomer { get; init; }

    public required IReadOnlyList<IntakeCandidate> Candidates { get; init; }
}
