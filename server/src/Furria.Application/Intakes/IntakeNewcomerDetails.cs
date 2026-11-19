using Furria.Application.Media;

namespace Furria.Application.Intakes;

public sealed record IntakeNewcomerDetails
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Phone { get; init; }

    public required string? Email { get; init; }

    public required bool ContactVisibleToMembers { get; init; }

    public required PictureDetails? Portrait { get; init; }
}
