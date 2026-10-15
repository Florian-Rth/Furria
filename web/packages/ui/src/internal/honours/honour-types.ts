import type { KkClubIcon } from '../club-icon';
import type { KkGroupTone } from '../group-tone';

export type KkAvatarFunctionKind = 'board' | 'admin' | 'role';

export interface KkAvatarFunction {
  kind: KkAvatarFunctionKind;
  label: string;
  short: string;
  icon: KkClubIcon;
  tone?: KkGroupTone;
}

export interface KkHonours {
  sessions: number;
  functions: readonly KkAvatarFunction[];
  sessionsLabel?: string;
}

export type KkStandingMembership = 'running' | 'paused' | 'none';

export type KkStandingApp = 'none' | 'invited' | 'active' | 'attention';

export interface KkStanding {
  membership: KkStandingMembership;
  app: KkStandingApp;
  feeReduced: boolean;
}
