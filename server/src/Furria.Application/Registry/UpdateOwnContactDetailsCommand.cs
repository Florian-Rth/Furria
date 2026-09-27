namespace Furria.Application.Registry;

public sealed record UpdateOwnContactDetailsCommand
{
    public required int PersonId { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }
}
