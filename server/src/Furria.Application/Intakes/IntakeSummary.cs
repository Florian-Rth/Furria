using Furria.Core.Intakes;

namespace Furria.Application.Intakes;

public sealed record IntakeSummary
{
    public required int IntakeId { get; init; }

    public required IntakeState State { get; init; }

    public required string? Label { get; init; }

    public required IntakePersonName? Newcomer { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<IntakeGroupName> Groups { get; init; }

    public required IntakePersonName? StartedBy { get; init; }

    public required bool CanManage { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required DateTimeOffset? SubmittedAt { get; init; }

    public required DateTimeOffset? CompletedAt { get; init; }

    public required DateTimeOffset? DiscardedAt { get; init; }
}
