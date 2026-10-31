namespace Furria.Application.Studio;

public sealed record ActEveningChoreographyVersionsQuery
{
    public required int ActId { get; init; }

    public required int EventId { get; init; }

    public required int? Before { get; init; }
}
