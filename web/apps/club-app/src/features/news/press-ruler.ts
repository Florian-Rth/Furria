import { carnivalDaysOf, sessionAt, sessionClosingAt } from '@/lib/club';
import type { HubSection } from './hub-view';
import type { NewsStage } from './types';

const SESSION_OPENING_MONTH_INDEX = 10;
const SESSION_OPENING_DAY = 11;
const DAY_MS = 86_400_000;
const HALF_DAY_MS = DAY_MS / 2;
const SEASON_MONTHS = [11, 0, 1, 2] as const;
const SUMMER_MONTHS = [3, 4, 5, 6, 7, 8, 9] as const;

export const CARNIVAL_SHARES = [0, 0.3, 0.62, 0.72, 1] as const;

const anchorsOf = (startYear: number): Date[] => [
  new Date(startYear, SESSION_OPENING_MONTH_INDEX, SESSION_OPENING_DAY),
  new Date(startYear + 1, 0, 1),
  carnivalDaysOf(startYear).womensCarnivalDay,
  sessionClosingAt(startYear),
  new Date(startYear + 1, SESSION_OPENING_MONTH_INDEX, SESSION_OPENING_DAY),
];

const shareAt = (index: number): number => CARNIVAL_SHARES[index] ?? 1;

export const carnivalShareOf = (date: Date, startYear: number): number => {
  const anchors = anchorsOf(startYear);
  const instant =
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() + HALF_DAY_MS;

  for (let index = 0; index < anchors.length - 1; index++) {
    const from = anchors[index]?.getTime() ?? 0;
    const to = anchors[index + 1]?.getTime() ?? 0;

    if (instant <= to) {
      const progress = Math.max(instant - from, 0) / (to - from);
      return shareAt(index) + (shareAt(index + 1) - shareAt(index)) * progress;
    }
  }

  return 1;
};

export const dateAtCarnivalShare = (share: number, startYear: number): Date => {
  const anchors = anchorsOf(startYear);
  const clamped = Math.min(Math.max(share, 0), 1);

  for (let index = 0; index < anchors.length - 1; index++) {
    if (clamped <= shareAt(index + 1)) {
      const from = anchors[index]?.getTime() ?? 0;
      const to = anchors[index + 1]?.getTime() ?? 0;
      const progress = (clamped - shareAt(index)) / (shareAt(index + 1) - shareAt(index));
      const instant = new Date(from + (to - from) * progress);
      return new Date(instant.getFullYear(), instant.getMonth(), instant.getDate());
    }
  }

  return anchors[anchors.length - 1] ?? new Date(startYear + 1, 10, 11);
};

export type RulerStage = Exclude<NewsStage, 'draft'>;

export interface RulerPost {
  id: string;
  stage: RulerStage;
  date: Date;
  title: string;
  share: number;
}

export interface RulerSession {
  startYear: number;
  present: boolean;
  posts: RulerPost[];
  festStart: number;
  roseMonday: number;
  summerStart: number;
  seasonTicks: number[];
  summerTicks: number[];
}

export interface PressRulerView {
  sessions: RulerSession[];
  today: number;
  draftCount: number;
  stageCounts: Record<NewsStage, number>;
}

const monthStartOf = (startYear: number, month: number): Date =>
  new Date(month >= SESSION_OPENING_MONTH_INDEX ? startYear : startYear + 1, month, 1);

const rulerSessionOf = (startYear: number, present: boolean, posts: RulerPost[]): RulerSession => {
  const days = carnivalDaysOf(startYear);
  const closing = sessionClosingAt(startYear);
  const shareOf = (date: Date): number => carnivalShareOf(date, startYear);

  return {
    startYear,
    present,
    posts,
    festStart: shareOf(days.womensCarnivalDay),
    roseMonday: shareOf(days.roseMonday),
    summerStart: shareAt(3),
    seasonTicks: SEASON_MONTHS.map((month) => monthStartOf(startYear, month))
      .filter((day) => day < closing)
      .map(shareOf),
    summerTicks: SUMMER_MONTHS.map((month) => monthStartOf(startYear, month))
      .filter((day) => day >= closing)
      .map(shareOf),
  };
};

const sessionYearOf = (date: Date): number => sessionAt(date).startYear;

export const pressRulerOf = (sections: readonly HubSection[], now: Date): PressRulerView => {
  const currentYear = sessionYearOf(now);
  const rows = sections.flatMap((section) => section.rows);
  const dated = rows.flatMap((row) =>
    row.stage === 'draft'
      ? []
      : [{ id: String(row.id), stage: row.stage, date: new Date(row.date), title: row.title }],
  );
  const firstYear = Math.min(currentYear, ...dated.map((post) => sessionYearOf(post.date)));
  const stageCounts: Record<NewsStage, number> = { draft: 0, live: 0, pending: 0, withdrawn: 0 };

  for (const row of rows) {
    if (row.stage === 'draft' || sessionYearOf(new Date(row.date)) === currentYear) {
      stageCounts[row.stage] += 1;
    }
  }

  const sessions = Array.from({ length: currentYear - firstYear + 1 }, (_, offset) => {
    const startYear = currentYear - offset;
    const posts = dated
      .filter((post) => sessionYearOf(post.date) === startYear)
      .map((post) => ({ ...post, share: carnivalShareOf(post.date, startYear) }));
    return rulerSessionOf(startYear, offset === 0, posts);
  });

  return {
    sessions,
    today: carnivalShareOf(now, currentYear),
    draftCount: stageCounts.draft,
    stageCounts,
  };
};
