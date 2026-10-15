using Furria.Core.Club;

namespace Furria.Application.Groups;

public sealed record CreateGroupCommand
{
    public required string Name { get; init; }

    public required int? GroupKindId { get; init; }

    public required ClubIcon? Icon { get; init; }
}
