import {
  dissolveBlock,
  placedLinesOf,
  toggleActWish,
  togglePin,
} from '@/features/running-order/running-order-ops';
import type {
  HoldKind,
  LineKey,
  Suggestion,
  SuggestionHold,
} from '@/features/running-order/schemas';
import type { RuleKey, RunningOrderDraft } from '@/features/running-order/types';

export interface HoldRow {
  id: string;
  kind: HoldKind;
  lineKey: LineKey | null;
  blockKeys: LineKey[];
  ruleKey: RuleKey | null;
  actWishId: number | null;
  held: number;
  without: number;
}

type HoldTarget = Pick<HoldRow, 'lineKey' | 'blockKeys' | 'ruleKey' | 'actWishId'>;

const NO_TARGET: HoldTarget = { lineKey: null, blockKeys: [], ruleKey: null, actWishId: null };

const targetOf = (draft: RunningOrderDraft, hold: SuggestionHold): HoldTarget | null => {
  const placed = placedLinesOf(draft);

  switch (hold.kind) {
    case 'pin': {
      const line = placed.find((candidate) => candidate.key === hold.lineKey && candidate.pinned);

      return line === undefined ? null : { ...NO_TARGET, lineKey: line.key };
    }
    case 'block': {
      const anchor = placed.find(
        (candidate) =>
          candidate.blockKey !== null &&
          (candidate.key === hold.lineKey || candidate.blockKey === hold.blockKey),
      );
      const members = placed.filter(
        (candidate) => anchor !== undefined && candidate.blockKey === anchor.blockKey,
      );

      return anchor === undefined
        ? null
        : { ...NO_TARGET, lineKey: anchor.key, blockKeys: members.map((line) => line.key) };
    }
    case 'mustRule': {
      const rule = hold.ruleIndex === null ? undefined : draft.rules[hold.ruleIndex];
      const relaxable = rule !== undefined && rule.strength === 'must';

      return relaxable ? { ...NO_TARGET, ruleKey: rule.ruleKey } : null;
    }
    case 'mustWish': {
      const wish = draft.actWishes.find(
        (candidate) =>
          candidate.actWishId === hold.actWishId &&
          candidate.strength === 'must' &&
          !draft.suspendedActWishIds.includes(candidate.actWishId),
      );

      return wish === undefined ? null : { ...NO_TARGET, actWishId: wish.actWishId };
    }
  }
};

export const holdRowsOf = (draft: RunningOrderDraft, suggestion: Suggestion): HoldRow[] =>
  suggestion.holds.flatMap((hold, at) => {
    const target = targetOf(draft, hold);
    const held = suggestion.conflictsAfter - hold.conflictsWithout;

    if (target === null || held <= 0) {
      return [];
    }

    return [
      {
        id: `${hold.kind}:${String(at)}`,
        kind: hold.kind,
        ...target,
        held,
        without: hold.conflictsWithout,
      },
    ];
  });

export const relaxHold = (draft: RunningOrderDraft, row: HoldRow): RunningOrderDraft => {
  switch (row.kind) {
    case 'pin':
      return row.lineKey === null ? draft : togglePin(draft, row.lineKey);
    case 'block':
      return row.lineKey === null ? draft : dissolveBlock(draft, row.lineKey);
    case 'mustRule':
      return {
        ...draft,
        rules: draft.rules.map((rule) =>
          rule.ruleKey === row.ruleKey ? { ...rule, strength: 'prefer' } : rule,
        ),
      };
    case 'mustWish':
      return row.actWishId === null ? draft : toggleActWish(draft, row.actWishId);
  }
};
