import type { KkScreenKind } from '../../screen-declaration';

export interface KkScreenStance {
  kind: KkScreenKind;
  section: string | null;
  headClearance: number;
  footClearance: number;
  indexClearance: number;
}
