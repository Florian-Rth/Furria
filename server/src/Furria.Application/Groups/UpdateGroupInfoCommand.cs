namespace Furria.Application.Groups;

public sealed record UpdateGroupInfoCommand
{
    public required int GroupId { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }
}
