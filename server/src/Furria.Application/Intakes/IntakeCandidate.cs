using Furria.Application.Media;
using Furria.Core.Intakes;

namespace Furria.Application.Intakes;

public sealed record IntakeCandidate
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required IntakeMatch Match { get; init; }

    public required bool IsMember { get; init; }

    public required IReadOnlyList<string> Groups { get; init; }

    public required bool HasAccount { get; init; }

    public required PictureDetails? Portrait { get; init; }
}
