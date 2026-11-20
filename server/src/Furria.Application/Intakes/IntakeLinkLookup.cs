using Furria.Core.Intakes;

namespace Furria.Application.Intakes;

public sealed record IntakeLinkLookup
{
    public required string? ClubName { get; init; }

    public required IntakeLinkState State { get; init; }

    public required bool AddressRequired { get; init; }
}
