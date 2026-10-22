import type { KkClubIcon } from '@furria/ui/club-icon';
import type {
  KkAvatarFunction,
  KkAvatarFunctionKind,
  KkHonours,
  KkStanding,
  KkStandingApp,
  KkStandingMembership,
} from '@furria/ui/honour-types';
import type {
  Honours,
  MembershipState,
  PersonFunction,
  PersonFunctionKind,
} from '@/lib/api/schemas';

const AVATAR_KINDS: Record<PersonFunctionKind, KkAvatarFunctionKind> = {
  boardSeat: 'board',
  groupAdmin: 'admin',
  role: 'role',
};

const FALLBACK_ICONS: Record<PersonFunctionKind, KkClubIcon> = {
  boardSeat: 'crown',
  groupAdmin: 'sparkle',
  role: 'shield',
};

const FUNCTION_LABELS: Record<PersonFunctionKind, (name: string) => string> = {
  boardSeat: (name) => `${name} · Vorstand`,
  groupAdmin: (name) => `Gruppen-Admin ${name}`,
  role: (name) => name,
};

const STANDING_MEMBERSHIPS: Record<MembershipState, KkStandingMembership> = {
  active: 'running',
  paused: 'paused',
  ended: 'none',
  none: 'none',
};

const STANDING_APPS: Readonly<Partial<Record<string, KkStandingApp>>> = {
  disabled: 'attention',
  invited: 'invited',
  active: 'active',
};

export const toSessionsLabel = (sessions: number): string | undefined => {
  if (sessions <= 0) {
    return undefined;
  }

  return sessions === 1 ? '1 Session' : `${sessions} Sessionen`;
};

export const toAvatarFunction = (entry: PersonFunction): KkAvatarFunction => {
  const base = {
    kind: AVATAR_KINDS[entry.kind],
    label: FUNCTION_LABELS[entry.kind](entry.name),
    short: entry.name,
    icon: entry.icon ?? FALLBACK_ICONS[entry.kind],
  };

  return entry.tone === null ? base : { ...base, tone: entry.tone };
};

export const toAvatarHonours = (honours: Honours): KkHonours => {
  const functions = honours.functions.map(toAvatarFunction);
  const sessionsLabel = toSessionsLabel(honours.sessions);

  return sessionsLabel === undefined
    ? { sessions: honours.sessions, functions }
    : { sessions: honours.sessions, functions, sessionsLabel };
};

export interface StandingFacts {
  membershipState: MembershipState;
  accessState: string;
  feeReduced: boolean;
}

export const toStanding = (facts: StandingFacts): KkStanding => ({
  membership: STANDING_MEMBERSHIPS[facts.membershipState],
  app: STANDING_APPS[facts.accessState] ?? 'none',
  feeReduced: facts.feeReduced,
});
