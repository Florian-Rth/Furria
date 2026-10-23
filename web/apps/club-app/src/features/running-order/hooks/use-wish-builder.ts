import { useState } from 'react';
import { addRule } from '@/features/running-order/running-order-ops';
import type { ActKind, RuleKind, Strength } from '@/features/running-order/schemas';
import type { RunningOrderDraft } from '@/features/running-order/types';
import type { WishChoice, WishState } from '../planner-wishes';
import {
  hasSameRule,
  outcomeOfRule,
  PAIR_WISH_KINDS,
  ruleOfChoice,
  spreadRuleOf,
} from '../planner-wishes';

export interface WishBuilder {
  kind: RuleKind | null;
  strength: Strength;
  otherActId: number | null;
  needsOther: boolean;
  outcome: WishState | null;
  duplicate: boolean;
  canAdd: boolean;
  chooseKind: (kind: RuleKind) => void;
  chooseStrength: (strength: Strength) => void;
  chooseOther: (actId: number) => void;
  add: () => void;
}

export const useLineWishBuilder = (
  draft: RunningOrderDraft,
  actId: number | null,
  apply: (next: RunningOrderDraft) => void,
): WishBuilder => {
  const [kind, setKind] = useState<RuleKind | null>(null);
  const [strength, setStrength] = useState<Strength>('must');
  const [otherActId, setOtherActId] = useState<number | null>(null);
  const [builtFor, setBuiltFor] = useState(actId);

  if (builtFor !== actId) {
    setBuiltFor(actId);
    setKind(null);
    setOtherActId(null);
  }

  const choice: WishChoice | null = kind === null ? null : { kind, strength, otherActId };
  const rule = choice === null || actId === null ? null : ruleOfChoice(actId, choice);
  const duplicate = rule !== null && hasSameRule(draft, rule);

  return {
    kind,
    strength,
    otherActId,
    needsOther: kind !== null && PAIR_WISH_KINDS.includes(kind),
    outcome: rule === null ? null : outcomeOfRule(draft, rule),
    duplicate,
    canAdd: rule !== null && !duplicate,
    chooseKind: (next) => {
      setKind(next);
    },
    chooseStrength: (next) => {
      setStrength(next);
    },
    chooseOther: (next) => {
      setOtherActId(next);
    },
    add: () => {
      if (rule === null || duplicate) {
        return;
      }
      apply(addRule(draft, rule));
      setKind(null);
      setOtherActId(null);
    },
  };
};

export interface EveningWishBuilder {
  actKind: ActKind | null;
  strength: Strength;
  outcome: WishState | null;
  duplicate: boolean;
  canAdd: boolean;
  chooseKind: (kind: ActKind) => void;
  chooseStrength: (strength: Strength) => void;
  add: () => void;
}

export const useEveningWishBuilder = (
  draft: RunningOrderDraft,
  apply: (next: RunningOrderDraft) => void,
): EveningWishBuilder => {
  const [actKind, setActKind] = useState<ActKind | null>(null);
  const [strength, setStrength] = useState<Strength>('must');
  const rule = actKind === null ? null : spreadRuleOf(actKind, strength);
  const duplicate = rule !== null && hasSameRule(draft, rule);

  return {
    actKind,
    strength,
    outcome: rule === null ? null : outcomeOfRule(draft, rule),
    duplicate,
    canAdd: rule !== null && !duplicate,
    chooseKind: (next) => {
      setActKind(next);
    },
    chooseStrength: (next) => {
      setStrength(next);
    },
    add: () => {
      if (rule === null || duplicate) {
        return;
      }
      apply(addRule(draft, rule));
      setActKind(null);
    },
  };
};
