namespace Furria.Core.RunningOrders;

public sealed class ActWish
{
    public int Id { get; set; }

    public int ActId { get; set; }

    public RunningOrderRuleKind Kind { get; set; }

    public RuleStrength Strength { get; set; }

    public Act? Act { get; set; }
}
