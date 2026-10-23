namespace Furria.Core.RunningOrders;

public sealed class RunningOrderRule
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public RunningOrderRuleKind Kind { get; set; }

    public RuleStrength Strength { get; set; }

    public int? ActId { get; set; }

    public int? OtherActId { get; set; }

    public ActKind? ActKind { get; set; }

    public RunningOrder? RunningOrder { get; set; }

    public Act? Act { get; set; }

    public Act? OtherAct { get; set; }
}
