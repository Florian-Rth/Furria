import type {
  ActKind,
  FindingKind,
  LineKey,
  RuleKind,
  RunningOrderResponse,
  Strength,
} from './schemas';
import { FINDING_KINDS } from './schemas';
import type { DraftLine, FindingTally, ReviewFinding, RuleKey, RunningOrderDraft } from './types';

interface CheckedRule {
  kind: RuleKind;
  strength: Strength;
  actId: number | null;
  otherActId: number | null;
  actKind: ActKind | null;
  ruleKey: RuleKey | null;
  actWishId: number | null;
}

type RuleOutcome = 'met' | 'broken' | 'skipped';

interface Evening {
  placed: DraftLine[];
  unplaced: DraftLine[];
  indexOf: Map<LineKey, number>;
  count: number;
}

export const actLineKeyOf = (actId: number): LineKey => `act:${actId}`;

export const ruleKeyOf = (ruleId: number): RuleKey => `rule:${ruleId}`;

export const lineKeyOf = (line: { act: { actId: number } }): LineKey =>
  actLineKeyOf(line.act.actId);

const presentIdsOf = (line: DraftLine): number[] =>
  line.act.cast.filter((person) => !person.absent).map((person) => person.personId);

const absentIdsOf = (line: DraftLine): number[] =>
  line.act.cast.filter((person) => person.absent).map((person) => person.personId);

const HALVES = 2;
const THIRDS = 3;
const MIN_ACTS_BETWEEN_APART = 1;
const BUILT_IN_SPREAD_KIND: ActKind = 'speech';

export const firstHalfLengthOf = (count: number): number => Math.ceil(count / HALVES);

const eveningOf = (draft: RunningOrderDraft): Evening => {
  const placed = draft.lines.filter((line) => line.placed);

  return {
    placed,
    unplaced: draft.lines.filter((line) => !line.placed),
    indexOf: new Map(placed.map((line, index) => [line.key, index])),
    count: placed.length,
  };
};

const finding = (
  kind: FindingKind,
  severity: ReviewFinding['severity'],
  lineKeys: LineKey[],
  personIds: number[] = [],
): ReviewFinding => ({ kind, severity, lineKeys, personIds, ruleKey: null, actWishId: null });

const sharedIdsOf = (first: DraftLine, second: DraftLine): number[] => {
  const secondIds = presentIdsOf(second);

  return presentIdsOf(first).filter((personId) => secondIds.includes(personId));
};

type LinePair = [DraftLine, DraftLine];

const adjacentPairsOf = (evening: Evening): LinePair[] =>
  evening.placed.flatMap((line, index): LinePair[] => {
    const next = evening.placed[index + 1];

    return next === undefined ? [] : [[line, next]];
  });

const changeoverFindingsOf = (evening: Evening): ReviewFinding[] => {
  const adjacent = adjacentPairsOf(evening).flatMap(([first, second]) => {
    const shared = sharedIdsOf(first, second);

    return shared.length === 0
      ? []
      : [finding('noChangeover', 'conflict', [first.key, second.key], shared)];
  });
  const tight = evening.placed.flatMap((line, index) => {
    const middle = evening.placed[index + 1];
    const third = evening.placed[index + 2];

    if (middle === undefined || third === undefined) {
      return [];
    }

    const middleIds = presentIdsOf(middle);
    const shared = sharedIdsOf(line, third).filter((personId) => !middleIds.includes(personId));

    return shared.length === 0
      ? []
      : [finding('tightChangeover', 'hint', [line.key, third.key], shared)];
  });

  return [...adjacent, ...tight];
};

const isSpreadRuleFor = (rules: readonly CheckedRule[], kind: ActKind): boolean =>
  rules.some((rule) => rule.kind === 'kindSpread' && rule.actKind === kind);

const sameKindPairsOf = (evening: Evening, kind: ActKind): LinePair[] =>
  adjacentPairsOf(evening).filter(
    ([first, second]) => first.act.kind === kind && second.act.kind === kind,
  );

const builtInSpreadFindingsOf = (
  evening: Evening,
  rules: readonly CheckedRule[],
): ReviewFinding[] =>
  isSpreadRuleFor(rules, BUILT_IN_SPREAD_KIND)
    ? []
    : sameKindPairsOf(evening, BUILT_IN_SPREAD_KIND).map(([first, second]) =>
        finding('sameKindAdjacent', 'hint', [first.key, second.key]),
      );

const singleOutcomeOf = (evening: Evening, kind: RuleKind, key: LineKey): RuleOutcome => {
  const index = evening.indexOf.get(key);

  if (index === undefined) {
    return 'skipped';
  }

  const third = Math.ceil(evening.count / THIRDS);
  const inFirstHalf = index < firstHalfLengthOf(evening.count);

  switch (kind) {
    case 'first':
      return index === 0 ? 'met' : 'broken';
    case 'last':
      return index === evening.count - 1 ? 'met' : 'broken';
    case 'firstHalf':
      return inFirstHalf ? 'met' : 'broken';
    case 'secondHalf':
      return inFirstHalf ? 'broken' : 'met';
    case 'early':
      return index < third ? 'met' : 'broken';
    case 'late':
      return index >= evening.count - third ? 'met' : 'broken';
    default:
      return 'skipped';
  }
};

const pairOutcomeOf = (
  evening: Evening,
  kind: RuleKind,
  key: LineKey,
  otherKey: LineKey,
): RuleOutcome => {
  const index = evening.indexOf.get(key);
  const other = evening.indexOf.get(otherKey);

  if (index === undefined || other === undefined) {
    return 'skipped';
  }

  switch (kind) {
    case 'before':
      return index < other ? 'met' : 'broken';
    case 'after':
      return index > other ? 'met' : 'broken';
    case 'apart':
      return Math.abs(index - other) - 1 >= MIN_ACTS_BETWEEN_APART ? 'met' : 'broken';
    default:
      return 'skipped';
  }
};

const missedFinding = (rule: CheckedRule, lineKeys: LineKey[]): ReviewFinding => ({
  ...finding(
    rule.strength === 'must' ? 'mustRuleBroken' : 'preferRuleMissed',
    rule.strength === 'must' ? 'conflict' : 'hint',
    lineKeys,
  ),
  ruleKey: rule.ruleKey,
  actWishId: rule.actWishId,
});

const PAIR_KINDS: readonly RuleKind[] = ['before', 'after', 'apart'];

const ruleFindingsOf = (evening: Evening, rule: CheckedRule): ReviewFinding[] => {
  if (rule.kind === 'kindSpread') {
    return rule.actKind === null
      ? []
      : sameKindPairsOf(evening, rule.actKind).map(([first, second]) =>
          missedFinding(rule, [first.key, second.key]),
        );
  }
  if (rule.actId === null) {
    return [];
  }

  const key = actLineKeyOf(rule.actId);
  const isPair = PAIR_KINDS.includes(rule.kind);

  if (isPair && rule.otherActId === null) {
    return [];
  }

  const otherKey = rule.otherActId === null ? null : actLineKeyOf(rule.otherActId);
  const outcome =
    isPair && otherKey !== null
      ? pairOutcomeOf(evening, rule.kind, key, otherKey)
      : singleOutcomeOf(evening, rule.kind, key);
  const lineKeys = isPair && otherKey !== null ? [key, otherKey] : [key];

  return outcome === 'broken' ? [missedFinding(rule, lineKeys)] : [];
};

const checkedRulesOf = (draft: RunningOrderDraft): CheckedRule[] => [
  ...draft.rules.map((rule) => ({
    kind: rule.kind,
    strength: rule.strength,
    actId: rule.actId,
    otherActId: rule.otherActId,
    actKind: rule.actKind,
    ruleKey: rule.ruleKey,
    actWishId: null,
  })),
  ...draft.actWishes
    .filter((wish) => !draft.suspendedActWishIds.includes(wish.actWishId))
    .map((wish) => ({
      kind: wish.kind,
      strength: wish.strength,
      actId: wish.actId,
      otherActId: null,
      actKind: null,
      ruleKey: null,
      actWishId: wish.actWishId,
    })),
];

const castFindingsOf = (line: DraftLine): ReviewFinding[] => {
  const cast = line.act.cast;
  const absent = absentIdsOf(line);

  if (line.act.group !== null && cast.length > 0 && absent.length === cast.length) {
    return [finding('nobodyThere', 'conflict', [line.key], absent)];
  }

  return absent.length === 0 ? [] : [finding('absences', 'hint', [line.key], absent)];
};

const unplacedFindingsOf = (evening: Evening): ReviewFinding[] =>
  evening.unplaced.length === 0
    ? []
    : [
        finding(
          'unplaced',
          'hint',
          evening.unplaced.map((line) => line.key),
        ),
      ];

const firstPositionOf = (evening: Evening, found: ReviewFinding): number => {
  const unplacedKeys = evening.unplaced.map((line) => line.key);
  const positions = found.lineKeys.map((key) => {
    const placedAt = evening.indexOf.get(key);

    return placedAt ?? evening.placed.length + unplacedKeys.indexOf(key);
  });

  return positions.length === 0 ? Number.MAX_SAFE_INTEGER : Math.min(...positions);
};

export const reviewRunningOrder = (draft: RunningOrderDraft): ReviewFinding[] => {
  const evening = eveningOf(draft);
  const rules = checkedRulesOf(draft);
  const found = [
    ...changeoverFindingsOf(evening),
    ...rules.flatMap((rule) => ruleFindingsOf(evening, rule)),
    ...builtInSpreadFindingsOf(evening, rules),
    ...[...evening.placed, ...evening.unplaced].flatMap(castFindingsOf),
    ...unplacedFindingsOf(evening),
  ];

  return found
    .map((entry) => ({ entry, position: firstPositionOf(evening, entry) }))
    .sort(
      (left, right) =>
        left.position - right.position ||
        FINDING_KINDS.indexOf(left.entry.kind) - FINDING_KINDS.indexOf(right.entry.kind),
    )
    .map(({ entry }) => entry);
};

export const tallyOf = (findings: readonly ReviewFinding[]): FindingTally => ({
  conflicts: findings.filter((entry) => entry.severity === 'conflict').length,
  hints: findings.filter((entry) => entry.severity === 'hint').length,
});

export const reviewFindingsOf = (response: RunningOrderResponse): ReviewFinding[] => {
  const keysById = new Map(response.lines.map((line) => [line.lineId, lineKeyOf(line)]));

  return response.findings.map((entry) => ({
    kind: entry.kind,
    severity: entry.severity,
    lineKeys: entry.lineIds.flatMap((lineId) => {
      const key = keysById.get(lineId);

      return key === undefined ? [] : [key];
    }),
    personIds: entry.personIds,
    ruleKey: entry.ruleId === null ? null : ruleKeyOf(entry.ruleId),
    actWishId: entry.actWishId,
  }));
};

export const findingsOfLine = (findings: readonly ReviewFinding[], key: LineKey): ReviewFinding[] =>
  findings.filter((entry) => entry.lineKeys.includes(key));
