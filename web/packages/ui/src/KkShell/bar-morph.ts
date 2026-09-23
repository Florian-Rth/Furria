import type { ComponentType, PropsWithChildren } from 'react';
import type { KkShellBarLead } from './internal/ui/KkShellBarLeading';
import type { KkScreenKind, KkScreenOrigin } from './screen-declaration';
import type { KkScreenMove } from './screen-move';

export type KkBarMorphName = 'broomSweep' | 'relay' | 'glassDrop';

export interface KkBarSnapshot {
  path: string;
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin: KkScreenOrigin | null;
}

export interface KkBarMorphScene {
  previous: KkBarSnapshot | null;
  current: KkBarSnapshot;
  move: KkScreenMove;
}

export interface KkBarMorphLeadingProps {
  scene: KkBarMorphScene;
}

export interface KkBarMorphBarProps extends PropsWithChildren {
  scene: KkBarMorphScene;
}

export interface KkBarMorph {
  Leading: ComponentType<KkBarMorphLeadingProps>;
  Bar?: ComponentType<KkBarMorphBarProps>;
}
