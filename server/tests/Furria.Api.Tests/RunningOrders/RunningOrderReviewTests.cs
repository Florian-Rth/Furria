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
    private const int Ben = 102;
    private const int Clara = 103;

    [Fact]
    public void Should_ReportNoChangeover_When_AdjacentSharedPerson()
    {
        var findings = FindingsOf([Nummer(Garde, 0, Anna, Ben), Nummer(Showtanz, 1, Ben, Anna)]);

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.NoChangeover, finding.Kind);
        Assert.Equal(FindingSeverity.Conflict, finding.Severity);
        Assert.Equal([LineKey.OfAct(Garde), LineKey.OfAct(Showtanz)], finding.Lines);
        Assert.Equal([Anna, Ben], finding.PersonIds);
    }

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
    public void Should_OnlyHintTheAbsence_When_AbsentPersonNoConflict()
    {
        var findings = FindingsOf([
            Nummer(Garde, 0, Anna) with
            {
                Cast = [Present(Anna), Absent(Ben)],
            },
            Nummer(Showtanz, 1, Clara) with
            {
                Cast = [Present(Clara), Absent(Ben)],
            },
        ]);

        Assert.Equal(
            [
                (FindingKind.Absences, LineKey.OfAct(Garde)),
                (FindingKind.Absences, LineKey.OfAct(Showtanz)),
            ],
            findings.Select(finding => (finding.Kind, finding.Lines.Single()))
        );
        Assert.All(findings, finding => Assert.Equal([Ben], finding.PersonIds));
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
    public void Should_HintPreferRuleMissed_When_PreferLastMissed()
    {
        var findings = FindingsOf(
            [Nummer(Finale, 0), Nummer(Garde, 1)],
            [Wish(RunningOrderRuleKind.Last, RuleStrength.Prefer, Finale, actWishId: 9)]
        );

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.PreferRuleMissed, finding.Kind);
        Assert.Equal(FindingSeverity.Hint, finding.Severity);
        Assert.Equal(9, finding.ActWishId);
        Assert.Null(finding.RuleId);
    }

    [Fact]
    public void Should_HintSameKindAdjacent_When_TwoSpeechesAdjacent()
    {
        var findings = FindingsOf([
            Nummer(Rede, 0) with
            {
                ActKind = ActKind.Speech,
            },
            Nummer(Buett, 1) with
            {
                ActKind = ActKind.Speech,
            },
        ]);

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.SameKindAdjacent, finding.Kind);
        Assert.Equal(FindingSeverity.Hint, finding.Severity);
        Assert.Equal([LineKey.OfAct(Rede), LineKey.OfAct(Buett)], finding.Lines);
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
    public void Should_ReportNobodyThere_When_WholeCastAbsent()
    {
        var findings = FindingsOf([
            Nummer(Garde, 0) with
            {
                HasGroup = true,
                Cast = [Absent(Anna), Absent(Ben)],
            },
        ]);

        var finding = Assert.Single(findings);
        Assert.Equal(FindingKind.NobodyThere, finding.Kind);
        Assert.Equal(FindingSeverity.Conflict, finding.Severity);
        Assert.Equal([Anna, Ben], finding.PersonIds);
    }

    [Fact]
    public void Should_HintUnplaced_When_UnplacedLine()
    {
        var findings = FindingsOf([
            Nummer(Rede, null),
            Nummer(Garde, 0, Anna),
            Nummer(Buett, null),
        ]);

        Assert.Equal(
            [
                (FindingKind.Unplaced, LineKey.OfAct(Rede)),
                (FindingKind.Unplaced, LineKey.OfAct(Buett)),
            ],
            findings.Select(finding => (finding.Kind, finding.Lines.Single()))
        );
        Assert.All(findings, finding => Assert.Equal(FindingSeverity.Hint, finding.Severity));
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
    public void Should_MissTheOtherHalf_When_HalvesByIndex()
    {
        var findings = FindingsOf(
            [
                Nummer(Garde, 0),
                Nummer(Rede, 1),
                Nummer(Showtanz, 2),
                Nummer(Buett, 3),
                Nummer(Finale, 4),
            ],
            [
                Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Prefer, Showtanz, ruleId: 1),
                Rule(RunningOrderRuleKind.SecondHalf, RuleStrength.Prefer, Showtanz, ruleId: 2),
                Rule(RunningOrderRuleKind.SecondHalf, RuleStrength.Prefer, Buett, ruleId: 3),
                Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Prefer, Buett, ruleId: 4),
            ]
        );

        Assert.Equal([2, 4], findings.Select(finding => finding.RuleId));
        Assert.All(findings, finding => Assert.Equal(FindingKind.PreferRuleMissed, finding.Kind));
    }

    [Fact]
    public void Should_CountTheMiddleIntoTheFirstHalf_When_OddCountMiddleInFirstHalf()
    {
        var findings = FindingsOf(
            [
                Nummer(Garde, 0),
                Nummer(Rede, 1),
                Nummer(Showtanz, 2),
                Nummer(Buett, 3),
                Nummer(Finale, 4),
            ],
            [
                Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Must, Showtanz, ruleId: 1),
                Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Must, Buett, ruleId: 2),
            ]
        );

        var finding = Assert.Single(findings);
        Assert.Equal((FindingKind.MustRuleBroken, 2), (finding.Kind, finding.RuleId));
    }

    [Fact]
    public void Should_CountTheLinesBetween_When_PairRulesAreChecked()
    {
        var findings = FindingsOf(
            [Nummer(Garde, 0), Nummer(Rede, 1), Nummer(Showtanz, 2)],
            [
                Rule(RunningOrderRuleKind.Apart, RuleStrength.Must, Garde, 1, otherActId: Rede),
                Rule(RunningOrderRuleKind.Apart, RuleStrength.Must, Garde, 2, Showtanz),
                Rule(RunningOrderRuleKind.Before, RuleStrength.Must, Showtanz, 3, Garde),
                Rule(RunningOrderRuleKind.After, RuleStrength.Must, Showtanz, 4, Garde),
            ]
        );

        Assert.Equal([1, 3], findings.Select(finding => finding.RuleId));
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

    [Fact]
    public void Should_ReadFindingsByFirstLineThenKind_When_SeveralFindingsMeet()
    {
        var findings = FindingsOf(
            [
                Nummer(Rede, null),
                Nummer(Garde, 0, Anna) with
                {
                    Cast = [Present(Anna), Absent(Clara)],
                },
                Nummer(Showtanz, 1, Anna),
            ],
            [Rule(RunningOrderRuleKind.First, RuleStrength.Must, Showtanz, ruleId: 1)]
        );

        Assert.Equal(
            [
                FindingKind.NoChangeover,
                FindingKind.Absences,
                FindingKind.MustRuleBroken,
                FindingKind.Unplaced,
            ],
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

    private static ReviewCastMember Present(int personId) => new(personId, false);

    private static ReviewCastMember Absent(int personId) => new(personId, true);

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

    private static ReviewRule Wish(
        RunningOrderRuleKind kind,
        RuleStrength strength,
        int actId,
        int actWishId
    ) =>
        new()
        {
            Kind = kind,
            Strength = strength,
            ActId = actId,
            OtherActId = null,
            ActKind = null,
            RuleId = null,
            ActWishId = actWishId,
        };
}
