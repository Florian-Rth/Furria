namespace Furria.Application.Groups;

public sealed record EndGroupAdminCommand
{
    public required int GroupId { get; init; }

    public required int GroupAdminId { get; init; }

    public required DateOnly EndedOn { get; init; }
}
