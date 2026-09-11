namespace Furria.Application.Groups;

public sealed record AddGroupAdminCommand
{
    public required int GroupId { get; init; }

    public required int PersonId { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }
}
