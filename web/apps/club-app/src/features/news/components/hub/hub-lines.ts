import type {
  KkPressFactTone,
  KkPressRowFact,
  KkPressRulerAxisLabel,
  KkPressRulerLane,
  KkPressRulerLegendEntry,
  KkPressRulerMarkState,
  KkRegisterMarkState,
} from '@furria/ui';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { sessionYearsLabelOf } from '@/lib/club';
import { formatSessionNumber } from '@/lib/membership-labels';
import {
  MISSING_FACT,
  PENDING_FACT,
  READY_FACT,
  RULER_FEST,
  RULER_LEGEND_WORDS,
  RULER_OPENING,
  RULER_SUMMER,
  rulerDraftsOf,
  WITHDRAWN_FACT,
} from '../../hub-copy';
import type { HubFact, HubSection } from '../../hub-view';
import { REQUIREMENT_WORDS, UNTITLED } from '../../news-copy';
import type { PressRulerView, RulerSession, RulerStage } from '../../press-ruler';
import { carnivalShareOf, dateAtCarnivalShare } from '../../press-ruler';
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

const RULER_MARK_STATES: Record<RulerStage, KkPressRulerMarkState> = {
  live: 'aligned',
  pending: 'shifted',
  withdrawn: 'struck',
};

const RULER_DAY_FORMAT = 'EEEEEE dd.MM.yyyy';
const SHORT_YEARS_FROM = 2;
const DECEMBER = 11;
const RULER_STAGES: readonly RulerStage[] = ['live', 'pending', 'withdrawn'];
const AXIS_MONTHS = [
  { month: 0, word: 'Jan' },
  { month: 1, word: 'Feb' },
  { month: DECEMBER, word: 'Dez' },
] as const;

const rulerDayOf = (date: Date): string => format(date, RULER_DAY_FORMAT, { locale: de });

const rulerLaneOf = (session: RulerSession): KkPressRulerLane => ({
  key: String(session.startYear),
  yearLabel: sessionYearsLabelOf(session.startYear).slice(SHORT_YEARS_FROM),
  numberLabel: `${sessionNumberOf(session.startYear)}.`,
  count: session.posts.length,
  present: session.present,
  marks: session.posts.map((post) => ({
    id: post.id,
    state: RULER_MARK_STATES[post.stage],
    share: post.share,
    day: format(post.date, 'yyyy-MM-dd'),
    dayLabel: rulerDayOf(post.date),
    title: titleOf(post.title),
  })),
  festStart: session.festStart,
  roseMonday: session.roseMonday,
  summerStart: session.summerStart,
  seasonTicks: session.seasonTicks,
  summerTicks: session.summerTicks,
  dayLabelAt: (share: number): string => rulerDayOf(dateAtCarnivalShare(share, session.startYear)),
});

export const rulerLanesOf = (view: PressRulerView): KkPressRulerLane[] =>
  view.sessions.map(rulerLaneOf);

export const rulerAxisOf = (view: PressRulerView): KkPressRulerAxisLabel[] => {
  const present = view.sessions[0];

  if (present === undefined) {
    return [];
  }

  const { startYear, festStart, summerStart } = present;
  const months = AXIS_MONTHS.map(({ month, word }) => ({
    text: word,
    share: carnivalShareOf(
      new Date(month === DECEMBER ? startYear : startYear + 1, month, 1),
      startYear,
    ),
    kind: 'month' as const,
  })).filter((label) => label.share < festStart);

  return [
    { text: RULER_OPENING, share: 0, kind: 'opening' },
    { text: RULER_FEST, share: (festStart + summerStart) / 2, kind: 'fest' },
    { text: RULER_SUMMER, share: 1, kind: 'summer' },
    ...months,
  ];
};

export const rulerLegendOf = (view: PressRulerView): KkPressRulerLegendEntry[] => {
  const posted = RULER_STAGES.map((stage) => ({
    state: REGISTER_STATES[stage],
    count: view.stageCounts[stage],
    label: RULER_LEGEND_WORDS[stage],
  }));
  const drafts = {
    state: REGISTER_STATES.draft,
    count: view.draftCount,
    label: rulerDraftsOf(view.draftCount),
  };

  return [...posted, drafts].filter((entry) => entry.count > 0);
};

export const sectionLandingOf = (sectionKey: string): string => `news-section-${sectionKey}`;
