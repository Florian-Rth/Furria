import type { KkPressPhase } from '@furria/ui';
import { isKkPressBusy, isKkPressStamped, KK_PRESS_BEATS_MS } from '@furria/ui';
import { format } from 'date-fns';
import type { NewsStage } from './types';

export type PressKind = 'first' | 'changes' | 'republish';

export type PressPhase = KkPressPhase;

export const STAGE_BEFORE_PRESS: Record<PressKind, NewsStage> = {
  first: 'draft',
  changes: 'pending',
  republish: 'withdrawn',
};

export const PRESS_BEATS_MS = KK_PRESS_BEATS_MS;

export interface PressCue {
  phase: PressPhase;
  atMs: number;
}

export const registerRemainderOf = (elapsedMs: number): number =>
  Math.max(PRESS_BEATS_MS.registerAtLeast - elapsedMs, 0);

export const pressCuesAfterRegister = (): PressCue[] => {
  const strikeAt = 0;
  const cutAt = strikeAt + PRESS_BEATS_MS.strike + PRESS_BEATS_MS.inkRoll;
  const stampAt = cutAt + PRESS_BEATS_MS.cut;
  const settledAt = stampAt + PRESS_BEATS_MS.stamp;

  return [
    { phase: 'strike', atMs: strikeAt },
    { phase: 'cut', atMs: cutAt },
    { phase: 'stamp', atMs: stampAt },
    { phase: 'settled', atMs: settledAt },
  ];
};

export const isPressBusy = isKkPressBusy;

export const isStamped = isKkPressStamped;

export const pressAddressOf = (host: string, path: string, slug: string): string =>
  `${host}${path}${slug}`;

export const pressDateOf = (iso: string): string => format(new Date(iso), 'dd.MM.yyyy');

export const pressTimeOf = (iso: string): string => format(new Date(iso), 'HH:mm');

export const pressSignatureOf = (signer: string, iso: string): string =>
  `${signer} · ${pressDateOf(iso)} · ${pressTimeOf(iso)}`;

export const pressMomentOf = (iso: string): string => format(new Date(iso), 'dd.MM.yy, HH:mm');

const PRESS_KINDS: Record<NewsStage, PressKind> = {
  draft: 'first',
  live: 'changes',
  pending: 'changes',
  withdrawn: 'republish',
};

export const pressKindOf = (stage: NewsStage): PressKind => PRESS_KINDS[stage];
