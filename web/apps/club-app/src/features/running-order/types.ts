import type { ActWish, FindingKind, LineAct, LineKey, RuleBody, Severity } from './schemas';

export interface DraftLine {
  key: LineKey;
  lineId: number | null;
  act: LineAct;
  placed: boolean;
  pinned: boolean;
  blockKey: number | null;
}

export type RuleKey = `rule:${number}` | `draft:${number}`;

export interface DraftRule extends RuleBody {
  ruleKey: RuleKey;
  ruleId: number | null;
}

export interface RunningOrderDraft {
  version: number | null;
  lines: DraftLine[];
  rules: DraftRule[];
  actWishes: ActWish[];
  suspendedActWishIds: number[];
}

export interface ReviewFinding {
  kind: FindingKind;
  severity: Severity;
  lineKeys: LineKey[];
  personIds: number[];
  ruleKey: RuleKey | null;
  actWishId: number | null;
}

export interface FindingTally {
  conflicts: number;
  hints: number;
}

export interface OrderUnit {
  keys: LineKey[];
  start: number;
  pinned: boolean;
  blockKey: number | null;
}
