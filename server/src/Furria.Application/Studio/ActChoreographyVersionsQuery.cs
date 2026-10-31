namespace Furria.Application.Studio;

public sealed record ActChoreographyVersionsQuery
{
    public required int ActId { get; init; }

    public required int? Before { get; init; }
}
