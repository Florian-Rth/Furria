using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;

namespace Furria.Api.Endpoints.Calendar;

public sealed record LiveDirectionDto
{
    public required int? AppearanceId { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset MovedAt { get; init; }

    [Pure]
    public static LiveDirectionDto From(LiveDirectionDetails live) =>
        new()
        {
            AppearanceId = live.AppearanceId,
            StartedAt = live.StartedAt,
            MovedAt = live.MovedAt,
        };
}
