namespace Furria.Application.Club;

public sealed record BoardOfficeUpdateCommand
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}
