namespace Furria.Application.Identity;

public sealed record ClaimCommand
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }
}
