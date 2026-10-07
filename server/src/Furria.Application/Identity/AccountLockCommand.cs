namespace Furria.Application.Identity;

public sealed record AccountLockCommand
{
    public required int PersonId { get; init; }

    public required bool IsDisabled { get; init; }

    public required int? ActorPersonId { get; init; }
}
