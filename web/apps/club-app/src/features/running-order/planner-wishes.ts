import { addRule } from '@/features/running-order/running-order-ops';
import { reviewRunningOrder } from '@/features/running-order/running-order-review';
import type {
  ActKind,
  LineKey,
  RuleBody,
  RuleKind,
  Strength,
} from '@/features/running-order/schemas';
import type { ReviewFinding, RuleKey, RunningOrderDraft } from '@/features/running-order/types';

export type WishSource = 'pin' | 'block' | 'actWish' | 'rule';

export type WishState = 'met' | 'conflict' | 'hint' | 'off';

export interface LineWish {
  id: string;
  source: WishSource;
  kind: RuleKind | null;
  strength: Strength;
  actId: number | null;
  otherActId: number | null;
  actKind: ActKind | null;
  state: WishState;
  ruleKey: RuleKey | null;
  actWishId: number | null;
}

export interface WishChoice {
  kind: RuleKind;
  strength: Strength;
  otherActId: number | null;
}

export const PAIR_WISH_KINDS: readonly RuleKind[] = ['before', 'after', 'apart'];

export const LINE_WISH_KINDS: readonly RuleKind[] = [
  'first',
  'last',
  'early',
  'late',
  'firstHalf',
  'secondHalf',
  'before',
  'after',
  'apart',
];

const stateOfFindings = (found: readonly ReviewFinding[]): WishState => {
  if (found.some((finding) => finding.kind === 'mustRuleBroken')) {
    return 'conflict';
  }
  if (found.some((finding) => finding.kind === 'preferRuleMissed')) {
    return 'hint';
  }

  return 'met';
};

const ruleWishOf = (
  rule: RunningOrderDraft['rules'][number],
  findings: readonly ReviewFinding[],
): LineWish => ({
  id: rule.ruleKey,
  source: 'rule',
  kind: rule.kind,
  strength: rule.strength,
  actId: rule.actId,
  otherActId: rule.otherActId,
  actKind: rule.actKind,
  state: stateOfFindings(findings.filter((finding) => finding.ruleKey === rule.ruleKey)),
  ruleKey: rule.ruleKey,
  actWishId: null,
});

export const lineWishesOf = (
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
  key: LineKey,
): LineWish[] => {
  const line = draft.lines.find((candidate) => candidate.key === key);

  if (line === undefined) {
    return [];
  }

  const actId = line.act.actId;

  const structural: LineWish[] = [
    ...(line.pinned ? [{ source: 'pin' as const, id: `pin:${key}` }] : []),
    ...(line.blockKey !== null ? [{ source: 'block' as const, id: `block:${key}` }] : []),
  ].map(({ source, id }) => ({
    id,
    source,
    kind: null,
    strength: 'must',
    actId,
    otherActId: null,
    actKind: null,
    state: 'met',
    ruleKey: null,
    actWishId: null,
  }));
  const actWishes: LineWish[] = draft.actWishes
    .filter((wish) => wish.actId === actId)
    .map((wish) => ({
      id: `wish:${wish.actWishId}`,
      source: 'actWish',
      kind: wish.kind,
      strength: wish.strength,
      actId,
      otherActId: null,
      actKind: null,
      state: draft.suspendedActWishIds.includes(wish.actWishId)
        ? 'off'
        : stateOfFindings(findings.filter((finding) => finding.actWishId === wish.actWishId)),
      ruleKey: null,
      actWishId: wish.actWishId,
    }));
  const rules = draft.rules
    .filter((rule) => rule.kind !== 'kindSpread')
    .filter((rule) => rule.actId === actId || rule.otherActId === actId)
    .map((rule) => ruleWishOf(rule, findings));

  return [...structural, ...actWishes, ...rules];
};

export const eveningWishesOf = (
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
): LineWish[] =>
  draft.rules
    .filter((rule) => rule.kind === 'kindSpread')
    .map((rule) => ruleWishOf(rule, findings));

export const wishCountOf = (draft: RunningOrderDraft): number => {
  const placed = draft.lines.filter((line) => line.placed);
  const pins = placed.filter((line) => line.pinned).length;
  const blocks = new Set(placed.flatMap((line) => (line.blockKey === null ? [] : [line.blockKey])))
    .size;
  const actWishes = draft.actWishes.filter(
    (wish) => !draft.suspendedActWishIds.includes(wish.actWishId),
  ).length;

  return pins + blocks + actWishes + draft.rules.length;
};

export const ruleOfChoice = (actId: number, choice: WishChoice): RuleBody | null => {
  const isPair = PAIR_WISH_KINDS.includes(choice.kind);

  if (choice.kind === 'kindSpread' || (isPair && choice.otherActId === null)) {
    return null;
  }

  return {
    kind: choice.kind,
    strength: choice.strength,
    actId,
    otherActId: isPair ? choice.otherActId : null,
    actKind: null,
  };
};

export const spreadRuleOf = (actKind: ActKind, strength: Strength): RuleBody => ({
  kind: 'kindSpread',
  strength,
  actId: null,
  otherActId: null,
  actKind,
});

export const outcomeOfRule = (draft: RunningOrderDraft, rule: RuleBody): WishState => {
  const withRule = addRule(draft, rule);
  const added = withRule.rules.at(-1);

  if (added === undefined) {
    return 'met';
  }

  return stateOfFindings(
    reviewRunningOrder(withRule).filter((finding) => finding.ruleKey === added.ruleKey),
  );
};

export const hasSameRule = (draft: RunningOrderDraft, rule: RuleBody): boolean =>
  draft.rules.some(
    (existing) =>
      existing.kind === rule.kind &&
      existing.actId === rule.actId &&
      existing.otherActId === rule.otherActId &&
      existing.actKind === rule.actKind,
  );
