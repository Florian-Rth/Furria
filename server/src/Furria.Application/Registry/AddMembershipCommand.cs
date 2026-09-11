namespace Furria.Application.Registry;

public sealed record AddMembershipCommand
{
    public required int PersonId { get; init; }

    public required DateOnly StartedOn { get; init; }

    public required DateOnly? EndedOn { get; init; }
}
