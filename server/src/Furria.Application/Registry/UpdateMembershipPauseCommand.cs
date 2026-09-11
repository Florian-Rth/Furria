namespace Furria.Application.Registry;

public sealed record UpdateMembershipPauseCommand
{
    public required int PersonId { get; init; }

    public required int MembershipId { get; init; }

    public required int PauseId { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int? LastSessionYear { get; init; }
}
