namespace Furria.Application.Club;

public sealed record AudiencePerson
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
