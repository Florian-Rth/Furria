using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record ActFactsCommand
{
    public required string Name { get; init; }

    public required int? GroupId { get; init; }

    public required ActKind? Kind { get; init; }

    public required IReadOnlyList<int> AddedPersonIds { get; init; }

    public required IReadOnlyList<int> RemovedPersonIds { get; init; }

    public required IReadOnlyList<ActWishInput> Wishes { get; init; }
}
