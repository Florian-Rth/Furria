using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Application.Registry;

public sealed record PersonFunctionDetails
{
    public required PersonFunctionKind Kind { get; init; }

    public required string Name { get; init; }

    public required ClubIcon? Icon { get; init; }

    public required GroupTone? Tone { get; init; }
}
