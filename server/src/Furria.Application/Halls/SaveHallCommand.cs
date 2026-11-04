using Furria.Core.Halls;

namespace Furria.Application.Halls;

public sealed record SaveHallCommand
{
    public required int HallId { get; init; }

    public required string Name { get; init; }

    public required HallDocument Document { get; init; }

    public required int Version { get; init; }
}
