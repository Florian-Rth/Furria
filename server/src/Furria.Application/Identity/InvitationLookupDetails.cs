using Furria.Core.Identity;

namespace Furria.Application.Identity;

public sealed record InvitationLookupDetails
{
    public required string FirstName { get; init; }

    public required string? LoginEmail { get; init; }

    public required bool ContactEmailTaken { get; init; }

    public required InvitationPurpose Purpose { get; init; }
}
