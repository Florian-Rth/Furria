import type {
  KkPressFactTone,
  KkPressPlanSegmentData,
  KkPressRowFact,
  KkRegisterMarkState,
} from '@furria/ui';
import { format } from 'date-fns';
import { sessionYearsLabelOf } from '@/lib/club';
import { formatSessionNumber } from '@/lib/membership-labels';
import { MISSING_FACT, PENDING_FACT, READY_FACT, WITHDRAWN_FACT } from '../../hub-copy';
import type { HubFact, HubSection, PlanSession } from '../../hub-view';
import { REQUIREMENT_WORDS, STAGE_WORDS, UNTITLED } from '../../news-copy';
import type { NewsStage } from '../../types';

const FIRST_SESSION_YEAR = 1955;

export const REGISTER_STATES: Record<NewsStage, KkRegisterMarkState> = {
  draft: 'loose',
  live: 'aligned',
  pending: 'shifted',
  withdrawn: 'struck',
};

export const sessionNumberOf = (startYear: number): number => startYear - FIRST_SESSION_YEAR;

export const sessionLineOf = (startYear: number, sessionNumber: number | null): string =>
  formatSessionNumber(sessionNumber ?? sessionNumberOf(startYear));

export const rowDateOf = (iso: string): string => format(new Date(iso), 'dd.MM.yy');

export const factDayOf = (iso: string): string => format(new Date(iso), 'dd.MM.');

export const factLineOf = (fact: HubFact): string | null => {
  switch (fact.kind) {
    case 'missing':
      return `${MISSING_FACT}: ${fact.missing.map((requirement) => REQUIREMENT_WORDS[requirement]).join(', ')}`;
    case 'ready':
      return READY_FACT;
    case 'pending':
      return `${PENDING_FACT} · ${factDayOf(fact.at)}`;
    case 'withdrawn':
      return `${WITHDRAWN_FACT} ${rowDateOf(fact.at)}`;
    case 'live':
      return null;
  }
};

export const sectionMetaOf = (section: HubSection): string | undefined =>
  section.startYear === null ? undefined : sessionLineOf(section.startYear, section.sessionNumber);

const FACT_TONES: Record<HubFact['kind'], KkPressFactTone> = {
  missing: 'warning',
  ready: 'success',
  live: 'muted',
  pending: 'accent',
  withdrawn: 'muted',
};

export const rowFactOf = (fact: HubFact): KkPressRowFact | null => {
  const text = factLineOf(fact);
  return text === null ? null : { text, tone: FACT_TONES[fact.kind] };
};

export const titleOf = (title: string): string => (title.trim().length === 0 ? UNTITLED : title);

export const planSegmentsOf = (
  plan: readonly PlanSession[],
  titles: ReadonlyMap<string, string>,
): KkPressPlanSegmentData[] =>
  plan.map((session, order) => ({
    key: String(session.startYear),
    label: sessionYearsLabelOf(session.startYear),
    meta: sessionLineOf(session.startYear, null),
    isPresent: order === plan.length - 1,
    ticks: session.ticks.map((tick) => ({
      id: String(tick.id),
      state: REGISTER_STATES[tick.stage],
      position: tick.position,
      label: `${titleOf(titles.get(String(tick.id)) ?? '')} · ${STAGE_WORDS[tick.stage]}`,
    })),
  }));
