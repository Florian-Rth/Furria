namespace Furria.Application.Studio;

public sealed record EveningCastCommand
{
    public required ActEveningCommand Evening { get; init; }

    public required int PersonId { get; init; }

    public required bool Dances { get; init; }
}
