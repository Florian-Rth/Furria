namespace Furria.Core.RunningOrders;

public sealed record SuggestionSearch
{
    public int NodeBudget { get; init; } = RunningOrderSuggestion.NodeBudget;

    public IReadOnlyList<LineKey> Seed { get; init; } = [];

    public CancellationToken Stop { get; init; }

    public Action<RunningOrderProposal>? Improved { get; init; }
}
