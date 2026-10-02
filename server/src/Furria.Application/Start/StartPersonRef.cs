namespace Furria.Application.Start;

public sealed record StartPersonRef
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
