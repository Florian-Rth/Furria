using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record BoardOfficeCreateCommand
{
    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required ClubIcon? Icon { get; init; }
}
