namespace Furria.Application.Intakes;

public sealed record ResolveIntakeCommand
{
    public required int ActorAccountId { get; init; }

    public required int IntakeId { get; init; }

    public required int? PersonId { get; init; }
}
