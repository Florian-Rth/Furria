namespace Furria.Application.Registry;

public sealed record PersonArchiveCommand
{
    public required int PersonId { get; init; }

    public required bool IsArchived { get; init; }

    public required int? ActorPersonId { get; init; }
}
