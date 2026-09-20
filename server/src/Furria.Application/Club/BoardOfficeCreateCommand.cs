namespace Furria.Application.Club;

public sealed record BoardOfficeCreateCommand
{
    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}
