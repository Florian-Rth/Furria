import type { KkScreenKind, KkScreenOrigin } from '../../screen-declaration';
import type { KkScreenMove } from '../../screen-move';
import type { KkShellBarLead } from '../ui/KkShellBarLeading';

export interface KkBarSnapshot {
  path: string;
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin: KkScreenOrigin | null;
}

export interface KkBarScene {
  previous: KkBarSnapshot | null;
  current: KkBarSnapshot;
  move: KkScreenMove;
}
