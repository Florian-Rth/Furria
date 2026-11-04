using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed record PlanPointDto
{
    public required double X { get; init; }

    public required double Y { get; init; }

    [Pure]
    public static PlanPointDto From(PlanPoint point) => new() { X = point.X, Y = point.Y };

    [Pure]
    public PlanPoint ToPoint() => new() { X = X, Y = Y };
}
