using Furria.Application.Groups;

namespace Furria.Application.Registry;

public sealed record ContactChangeDetails
{
    public required DateTimeOffset At { get; init; }

    public required PersonReference? ChangedBy { get; init; }
}
