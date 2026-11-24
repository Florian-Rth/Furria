using Furria.Core.RunningOrders;
using Xunit;

namespace Furria.Api.Tests.RunningOrders;

public sealed class RunningOrderReviewTests
{
    private const int Garde = 1;
    private const int Rede = 2;
    private const int Showtanz = 3;
    private const int Buett = 4;
    private const int Finale = 5;

    private const int Anna = 101;
    private const int Clara = 103;

    [Fact]
    public void Should_HintTightChangeover_When_OneBetweenSharedPerson()
    {
        var findings = FindingsOf([
            Nummer(Garde, 0, Anna),
            Nummer(Rede, 1, Clara),
            Nummer(Showtanz, 2, Anna),
        ]);

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.TightChangeover, finding.Kind);
        Assert.Equal(FindingSeverity.Hint, finding.Severity);
        Assert.Equal([LineKey.OfAct(Garde), LineKey.OfAct(Showtanz)], finding.Lines);
        Assert.Equal([Anna], finding.PersonIds);
    }

    [Fact]
    public void Should_ReportMustRuleBroken_When_MustFirstBroken()
    {
        var findings = FindingsOf(
            [Nummer(Garde, 0), Nummer(Finale, 1)],
            [Rule(RunningOrderRuleKind.First, RuleStrength.Must, Finale, ruleId: 7)]
        );

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.MustRuleBroken, finding.Kind);
        Assert.Equal(FindingSeverity.Conflict, finding.Severity);
        Assert.Equal([LineKey.OfAct(Finale)], finding.Lines);
        Assert.Equal(7, finding.RuleId);
        Assert.Null(finding.ActWishId);
    }

    [Fact]
    public void Should_ReportTheRuleInstead_When_KindSpreadRuleReplacesBuiltIn()
    {
        var findings = FindingsOf(
            [
                Nummer(Rede, 0) with
                {
                    ActKind = ActKind.Speech,
                },
                Nummer(Buett, 1) with
                {
                    ActKind = ActKind.Speech,
                },
            ],
            [
                Rule(RunningOrderRuleKind.KindSpread, RuleStrength.Must, null, ruleId: 4) with
                {
                    ActKind = ActKind.Speech,
                },
            ]
        );

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.MustRuleBroken, finding.Kind);
        Assert.Equal([LineKey.OfAct(Rede), LineKey.OfAct(Buett)], finding.Lines);
        Assert.Equal(4, finding.RuleId);
    }

    [Fact]
    public void Should_CountThirdsRoundedUp_When_EarlyLateThirds()
    {
        var findings = FindingsOf(
            [Nummer(Garde, 0), Nummer(Rede, 1), Nummer(Showtanz, 2), Nummer(Buett, 3)],
            [
                Rule(RunningOrderRuleKind.Early, RuleStrength.Must, Rede, ruleId: 1),
                Rule(RunningOrderRuleKind.Early, RuleStrength.Must, Showtanz, ruleId: 2),
                Rule(RunningOrderRuleKind.Late, RuleStrength.Must, Showtanz, ruleId: 3),
                Rule(RunningOrderRuleKind.Late, RuleStrength.Must, Rede, ruleId: 4),
            ]
        );

        Assert.Equal([4, 2], findings.Select(finding => finding.RuleId));
        Assert.All(findings, finding => Assert.Equal(FindingKind.MustRuleBroken, finding.Kind));
    }

    [Fact]
    public void Should_LeaveTheTightChangeoverOut_When_ThePersonIsAlsoInTheMiddleNummer()
    {
        var findings = FindingsOf([
            Nummer(Garde, 0, Anna),
            Nummer(Rede, 1, Anna),
            Nummer(Showtanz, 2, Anna),
        ]);

        Assert.Equal(
            [FindingKind.NoChangeover, FindingKind.NoChangeover],
            findings.Select(finding => finding.Kind)
        );
    }

    private static IReadOnlyList<RunningOrderFinding> FindingsOf(
        IReadOnlyList<ReviewLine> lines,
        IReadOnlyList<ReviewRule>? rules = null
    ) => RunningOrderReview.FindingsOf(new() { Lines = lines, Rules = rules ?? [] });

    private static ReviewLine Nummer(int actId, int? position, params int[] presentPersonIds) =>
        new()
        {
            Key = LineKey.OfAct(actId),
            ActKind = null,
            HasGroup = false,
            Position = position,
            IsPinned = false,
            BlockKey = null,
            Cast = [.. presentPersonIds.Select(personId => new ReviewCastMember(personId, false))],
        };

    private static ReviewRule Rule(
        RunningOrderRuleKind kind,
        RuleStrength strength,
        int? actId,
        int ruleId,
        int? otherActId = null
    ) =>
        new()
        {
            Kind = kind,
            Strength = strength,
            ActId = actId,
            OtherActId = otherActId,
            ActKind = null,
            RuleId = ruleId,
            ActWishId = null,
        };
}
