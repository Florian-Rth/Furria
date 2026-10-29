using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record ActSummary
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int? SessionYear { get; init; }

    public required bool IsClosed { get; init; }

    public required ActGroupReference? Group { get; init; }

    public required bool IsArchived { get; init; }

    public required IReadOnlyList<CastMember> Cast { get; init; }

    public required IReadOnlyList<CastMember> Added { get; init; }

    public required IReadOnlyList<CastMember> Removed { get; init; }

    public required IReadOnlyList<ActWishDetails> Wishes { get; init; }
}
