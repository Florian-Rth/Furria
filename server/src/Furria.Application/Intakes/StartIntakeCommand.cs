namespace Furria.Application.Intakes;

public sealed record StartIntakeCommand
{
    public required int ActorAccountId { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }

    public required string? Label { get; init; }
}
