import type { StudioEvening } from '@/features/acts/schemas';
import { toDayLine, toSlotAside } from './act-card-copy';
import { eveningSlotOf } from './act-card-model';

export type EveningLeadTone = 'ink' | 'accent' | 'muted';

export interface EveningRow {
  lead: string;
  leadTone: EveningLeadTone;
  meta: string;
  current: boolean;
}

const BLANK_LEAD = '–';

export const eveningRowOf = (evening: StudioEvening, nextEventId: number | null): EveningRow => {
  const slot = eveningSlotOf(evening.appearance === null ? undefined : evening.appearance.position);
  const current = evening.eventId === nextEventId;
  const aside = toSlotAside(slot);
  const day = toDayLine(evening.startsAt);
  const meta = aside === '' ? day : `${day} · ${aside}`;

  if (slot.kind !== 'placed') {
    return { lead: BLANK_LEAD, leadTone: 'muted', meta, current };
  }

  return { lead: String(slot.number), leadTone: current ? 'accent' : 'ink', meta, current };
};
