namespace Furria.Application.Intakes;

public sealed record EditIntakeCommand
{
    public required int ActorAccountId { get; init; }

    public required int IntakeId { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }

    public required string? Label { get; init; }
}
