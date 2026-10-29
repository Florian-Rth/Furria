import {
  moveUnit,
  orderOf,
  placedLinesOf,
  previewMove,
  unitsOf,
} from '@/features/running-order/running-order-ops';
import { reviewRunningOrder, tallyOf } from '@/features/running-order/running-order-review';
import type { LineKey } from '@/features/running-order/schemas';
import type {
  FindingTally,
  ReviewFinding,
  RunningOrderDraft,
} from '@/features/running-order/types';

export interface PlannerFix {
  key: LineKey;
  to: number;
  fromTray: boolean;
}

export type PlaceChange = 'better' | 'same' | 'worse';

export interface PlaceOption {
  to: number;
  current: boolean;
  recommended: boolean;
  tally: FindingTally;
  change: PlaceChange;
  delta: FindingTally;
  previousKey: LineKey | null;
  last: boolean;
}

const CONFLICT_WEIGHT = 1000;
const HINT_WEIGHT = 10;
const MOVE_WEIGHT = 4;

const costOf = (tally: FindingTally): number =>
  tally.conflicts * CONFLICT_WEIGHT + tally.hints * HINT_WEIGHT;

const sameFinding = (left: ReviewFinding, right: ReviewFinding): boolean =>
  left.kind === right.kind &&
  left.ruleKey === right.ruleKey &&
  left.actWishId === right.actWishId &&
  left.lineKeys.length === right.lineKeys.length &&
  left.lineKeys.every((key) => right.lineKeys.includes(key));

const isMovable = (draft: RunningOrderDraft, key: LineKey): boolean => {
  const unit = unitsOf(draft).find((candidate) => candidate.keys.includes(key));

  return unit === undefined || !unit.pinned;
};

export const unitLeadOf = (draft: RunningOrderDraft, key: LineKey): LineKey =>
  unitsOf(draft).find((candidate) => candidate.keys.includes(key))?.keys[0] ?? key;

const sameOrder = (left: readonly LineKey[], right: readonly LineKey[]): boolean =>
  left.length === right.length && left.every((key, index) => right[index] === key);

const FIXLESS_KINDS: readonly ReviewFinding['kind'][] = ['nobodyThere', 'absences'];

export const fixOf = (draft: RunningOrderDraft, finding: ReviewFinding): PlannerFix | null => {
  if (FIXLESS_KINDS.includes(finding.kind)) {
    return null;
  }

  const before = orderOf(draft);
  const baseline = costOf(tallyOf(reviewRunningOrder(draft)));
  const slots = placedLinesOf(draft).length;
  let best: { key: LineKey; to: number; cost: number } | null = null;

  const leads = [
    ...new Set(
      finding.lineKeys
        .filter((candidate) => isMovable(draft, candidate))
        .map((candidate) => unitLeadOf(draft, candidate)),
    ),
  ];

  for (const key of leads) {
    const from = before.indexOf(key);
    const range = from < 0 ? slots + 1 : slots;

    for (let to = 0; to < range; to += 1) {
      const moved = moveUnit(draft, key, to);
      const order = orderOf(moved);

      if (sameOrder(order, before)) {
        continue;
      }

      const found = reviewRunningOrder(moved);
      const landed = order.indexOf(key);
      const travel = from < 0 ? 0 : Math.abs(landed - from);
      const cost = costOf(tallyOf(found)) + travel * MOVE_WEIGHT;
      const resolves = !found.some((candidate) => sameFinding(candidate, finding));

      if (
        resolves &&
        cost < baseline + travel * MOVE_WEIGHT &&
        (best === null || cost < best.cost)
      ) {
        best = { key, to: landed, cost };
      }
    }
  }

  if (best === null) {
    return null;
  }

  return { key: best.key, to: best.to, fromTray: !before.includes(best.key) };
};

const isBetter = (candidate: FindingTally, best: FindingTally): boolean =>
  candidate.conflicts < best.conflicts ||
  (candidate.conflicts === best.conflicts && candidate.hints < best.hints);

const changeOf = (after: FindingTally, now: FindingTally): PlaceChange => {
  if (isBetter(after, now)) {
    return 'better';
  }

  return isBetter(now, after) ? 'worse' : 'same';
};

const recommendedOf = (
  options: readonly PlaceOption[],
  now: FindingTally,
  from: number,
): number | null => {
  let best: PlaceOption | null = null;

  for (const option of options) {
    const closer =
      best !== null &&
      !isBetter(best.tally, option.tally) &&
      Math.abs(option.to - from) < Math.abs(best.to - from);

    if (!option.current && (best === null || isBetter(option.tally, best.tally) || closer)) {
      best = option;
    }
  }

  return best !== null && (from < 0 || isBetter(best.tally, now)) ? best.to : null;
};

export const placeOptionsOf = (draft: RunningOrderDraft, lineKey: LineKey): PlaceOption[] => {
  const key = unitLeadOf(draft, lineKey);
  const unitSize = unitsOf(draft).find((unit) => unit.keys.includes(key))?.keys.length ?? 1;
  const before = orderOf(draft);
  const now = tallyOf(reviewRunningOrder(draft));
  const from = before.indexOf(key);
  const range = from < 0 ? before.length + 1 : before.length;
  const seen: LineKey[][] = [];
  const options: PlaceOption[] = [];

  for (let to = 0; to < range; to += 1) {
    const preview = previewMove(draft, key, to);

    if (seen.some((order) => sameOrder(order, preview.order))) {
      continue;
    }
    seen.push(preview.order);

    const landed = preview.order.indexOf(key);

    options.push({
      to: landed,
      current: sameOrder(preview.order, before),
      recommended: false,
      tally: preview.tally,
      change: changeOf(preview.tally, now),
      delta: {
        conflicts: preview.tally.conflicts - now.conflicts,
        hints: preview.tally.hints - now.hints,
      },
      previousKey: preview.order[landed - 1] ?? null,
      last: preview.order[landed + unitSize] === undefined,
    });
  }

  const recommended = recommendedOf(options, now, from);

  return options
    .map((option) => ({ ...option, recommended: option.to === recommended }))
    .sort((left, right) => left.to - right.to);
};

export const bestSpotOf = (draft: RunningOrderDraft, key: LineKey): number => {
  const lead = unitLeadOf(draft, key);
  const unitKeys = unitsOf(draft).find((unit) => unit.keys.includes(lead))?.keys ?? [lead];
  const slots = orderOf(draft).filter((member) => !unitKeys.includes(member)).length;
  let best: { to: number; tally: FindingTally } | null = null;

  for (let to = 0; to <= slots; to += 1) {
    const preview = previewMove(draft, lead, to);
    const landed = preview.order.indexOf(lead);

    if (landed >= 0 && (best === null || isBetter(preview.tally, best.tally))) {
      best = { to: landed, tally: preview.tally };
    }
  }

  return best?.to ?? slots;
};

export const placeAtBest = (draft: RunningOrderDraft, key: LineKey): RunningOrderDraft =>
  moveUnit(draft, unitLeadOf(draft, key), bestSpotOf(draft, key));

export const placeAllAtBest = (draft: RunningOrderDraft): RunningOrderDraft =>
  draft.lines
    .filter((line) => !line.placed)
    .reduce((current, line) => placeAtBest(current, line.key), draft);

const sameFix = (left: PlannerFix, right: PlannerFix): boolean =>
  left.key === right.key && left.to === right.to;

export const distinctFixesOf = (
  draft: RunningOrderDraft,
  groups: readonly (readonly ReviewFinding[])[],
): (PlannerFix | null)[] => {
  const offered: PlannerFix[] = [];

  return groups.map((group) => {
    const fix =
      group.map((finding) => fixOf(draft, finding)).find((candidate) => candidate !== null) ?? null;

    if (fix === null || offered.some((earlier) => sameFix(earlier, fix))) {
      return null;
    }
    offered.push(fix);

    return fix;
  });
};
