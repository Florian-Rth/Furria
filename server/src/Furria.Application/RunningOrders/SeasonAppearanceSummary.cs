using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record SeasonAppearanceSummary
{
    public required int AppearanceId { get; init; }

    public required int EventId { get; init; }

    public required int? Position { get; init; }

    public required IReadOnlyList<EveningChange> Changes { get; init; }

    public required IReadOnlyList<CastMember> Added { get; init; }

    public required IReadOnlyList<CastMember> Removed { get; init; }
}
