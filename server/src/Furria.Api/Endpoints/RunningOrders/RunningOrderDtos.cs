using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed record RunningOrderActDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required IReadOnlyList<CastPersonDto> Cast { get; init; }

    [Pure]
    public static RunningOrderActDto From(RunningOrderActDetails act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            Group = ActGroupDto.From(act.Group),
            Cast = [.. act.Cast.Select(CastPersonDto.From)],
        };
}

public sealed record RunningOrderLineDto
{
    public required int LineId { get; init; }

    public required RunningOrderActDto Act { get; init; }

    public required int? Position { get; init; }

    public required bool Pinned { get; init; }

    public required int? BlockKey { get; init; }

    public required bool EveningChanged { get; init; }

    [Pure]
    public static RunningOrderLineDto From(RunningOrderLineDetails line) =>
        new()
        {
            LineId = line.LineId,
            Act = RunningOrderActDto.From(line.Act),
            Position = line.Position,
            Pinned = line.IsPinned,
            BlockKey = line.BlockKey,
            EveningChanged = line.IsEveningChanged,
        };
}

public sealed record RunningOrderRuleDto
{
    public required int RuleId { get; init; }

    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    public required int? ActId { get; init; }

    public required int? OtherActId { get; init; }

    public required ActKind? ActKind { get; init; }

    [Pure]
    public static RunningOrderRuleDto From(RunningOrderRuleDetails rule) =>
        new()
        {
            RuleId = rule.RuleId,
            Kind = rule.Kind,
            Strength = rule.Strength,
            ActId = rule.ActId,
            OtherActId = rule.OtherActId,
            ActKind = rule.ActKind,
        };
}

public sealed record RunningOrderActWishDto
{
    public required int ActWishId { get; init; }

    public required int ActId { get; init; }

    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    public required bool Suspended { get; init; }

    [Pure]
    public static RunningOrderActWishDto From(RunningOrderActWishDetails wish) =>
        new()
        {
            ActWishId = wish.Wish.ActWishId,
            ActId = wish.Wish.ActId,
            Kind = wish.Wish.Kind,
            Strength = wish.Wish.Strength,
            Suspended = wish.IsSuspended,
        };
}

public sealed record RunningOrderFindingDto
{
    public required FindingKind Kind { get; init; }

    public required FindingSeverity Severity { get; init; }

    public required IReadOnlyList<int> LineIds { get; init; }

    public required IReadOnlyList<int> PersonIds { get; init; }

    public required int? RuleId { get; init; }

    public required int? ActWishId { get; init; }

    [Pure]
    public static RunningOrderFindingDto From(RunningOrderFindingDetails finding) =>
        new()
        {
            Kind = finding.Kind,
            Severity = finding.Severity,
            LineIds = finding.LineIds,
            PersonIds = finding.PersonIds,
            RuleId = finding.RuleId,
            ActWishId = finding.ActWishId,
        };
}

public sealed record RunningOrderLineDataDto
{
    public required int ActId { get; init; }

    public required int? Position { get; init; }

    public required bool Pinned { get; init; }

    public required int? BlockKey { get; init; }

    [Pure]
    public RunningOrderLineDraft ToDraft() =>
        new()
        {
            ActId = ActId,
            Position = Position,
            IsPinned = Pinned,
            BlockKey = BlockKey,
        };
}

public sealed record RunningOrderRuleDataDto
{
    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    public required int? ActId { get; init; }

    public required int? OtherActId { get; init; }

    public required ActKind? ActKind { get; init; }

    [Pure]
    public RunningOrderRuleDraft ToDraft() =>
        new()
        {
            Kind = Kind,
            Strength = Strength,
            ActId = ActId,
            OtherActId = OtherActId,
            ActKind = ActKind,
        };
}
