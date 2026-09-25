using Furria.Application.Groups;
using Furria.Core.Identity;

namespace Furria.Application.Identity;

public sealed record AccountEventDetails
{
    public required AccountEventKind Kind { get; init; }

    public required DateTimeOffset At { get; init; }

    public required PersonReference? Actor { get; init; }
}
