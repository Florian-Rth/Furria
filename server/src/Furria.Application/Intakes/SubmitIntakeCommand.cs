namespace Furria.Application.Intakes;

public sealed record SubmitIntakeCommand
{
    public required string Token { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Phone { get; init; }

    public required string? Email { get; init; }
}
