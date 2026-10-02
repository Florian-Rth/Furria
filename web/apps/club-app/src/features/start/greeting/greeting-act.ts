import type { Me, MembershipState, MeRelevantSession } from '@/lib/api/schemas';
import {
  calendarDaysBetween,
  carnivalDaysOf,
  daysUntilOpening,
  relevantSessionYear,
  SESSION_OPENING_DAY,
  SESSION_OPENING_MONTH,
  sessionAt,
  sessionDayOf,
  sessionOpeningAt,
} from '@/lib/club';
import { toIsoDay } from '@/lib/day';

export type GreetingMoment =
  | 'openingCountdown'
  | 'carnivalCall'
  | 'birthday'
  | 'joinAnniversary'
  | 'womensCarnivalDay'
  | 'roseMonday'
  | 'carnivalTuesday'
  | 'ashWednesday'
  | 'welcome'
  | 'daily';

export type SeasonClause =
  | { kind: 'untilOpening'; days: number }
  | { kind: 'openingTomorrow' }
  | { kind: 'openingToday' }
  | { kind: 'sessionDay'; day: number }
  | { kind: 'untilWomensCarnivalDay'; days: number };

export interface GreetingViewer {
  birthDate: string | null;
  membershipState: MembershipState;
  memberSince: string | null;
  relevantSession: MeRelevantSession | null;
  appSince: string | null;
}

type CarnivalMoment = 'womensCarnivalDay' | 'roseMonday' | 'carnivalTuesday' | 'ashWednesday';

type ClauselessMoment = 'carnivalCall' | CarnivalMoment;

type ClausedMoment = 'birthday' | 'welcome' | 'daily';

type GreetingOccasion =
  | { moment: 'openingCountdown'; secondsToOpening: number; clause: null }
  | { moment: 'joinAnniversary'; years: number; clause: SeasonClause }
  | { [TMoment in ClauselessMoment]: { moment: TMoment; clause: null } }[ClauselessMoment]
  | { [TMoment in ClausedMoment]: { moment: TMoment; clause: SeasonClause } }[ClausedMoment];

export type GreetingAct = GreetingOccasion & {
  festive: boolean;
  night: boolean;
  key: string;
  sessionYear: number;
  ordinal: number | null;
};

const MS_PER_SECOND = 1000;
const COUNTDOWN_REACH_MS = 11 * 60 * MS_PER_SECOND;
const WOMENS_CARNIVAL_DAY_REACH = 11;
const NIGHT_FROM_HOUR = 23;
const NIGHT_UNTIL_HOUR = 5;
const LEAP_DAY = '02-29';
const LEAP_DAY_STAND_IN = '02-28';
const MONTH_DAY_START = 5;
const YEAR_LENGTH = 4;
const ANNIVERSARY_STEPS = [5, 11] as const;
const FESTIVE_NUMBERS: ReadonlySet<number> = new Set([
  11, 22, 33, 44, 55, 66, 77, 88, 99, 111, 222, 333,
]);
const FESTIVE_MOMENTS: ReadonlySet<GreetingMoment> = new Set([
  'carnivalCall',
  'womensCarnivalDay',
  'roseMonday',
  'carnivalTuesday',
  'birthday',
]);
const ORDINAL_MOMENTS: ReadonlySet<GreetingMoment> = new Set([
  'openingCountdown',
  'carnivalCall',
  'ashWednesday',
]);
const RUNNING_STATES: ReadonlySet<MembershipState> = new Set(['active', 'paused']);

export const toGreetingViewer = (me: Me): GreetingViewer => ({
  birthDate: me.person.birthDate,
  membershipState: me.membership.state,
  memberSince: me.membership.memberSince,
  relevantSession: me.membership.relevantSession,
  appSince: me.appSince,
});

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const observedMonthDay = (isoDay: string, year: number): string => {
  const monthDay = isoDay.slice(MONTH_DAY_START);

  return monthDay === LEAP_DAY && !isLeapYear(year) ? LEAP_DAY_STAND_IN : monthDay;
};

const fallsOn = (isoDay: string | null, now: Date): boolean =>
  isoDay !== null &&
  observedMonthDay(isoDay, now.getFullYear()) === toIsoDay(now).slice(MONTH_DAY_START);

const yearsSince = (isoDay: string, now: Date): number =>
  now.getFullYear() - Number(isoDay.slice(0, YEAR_LENGTH));

const isOpeningDay = (now: Date): boolean =>
  now.getMonth() === SESSION_OPENING_MONTH - 1 && now.getDate() === SESSION_OPENING_DAY;

const carnivalMomentAt = (now: Date): CarnivalMoment | null => {
  const days = carnivalDaysOf(sessionAt(now).startYear);
  const today = toIsoDay(now);

  if (today === toIsoDay(days.womensCarnivalDay)) {
    return 'womensCarnivalDay';
  }
  if (today === toIsoDay(days.roseMonday)) {
    return 'roseMonday';
  }
  if (today === toIsoDay(days.carnivalTuesday)) {
    return 'carnivalTuesday';
  }
  if (today === toIsoDay(days.ashWednesday)) {
    return 'ashWednesday';
  }

  return null;
};

export const seasonClauseAt = (now: Date): SeasonClause => {
  const day = sessionDayOf(now);

  if (day === null) {
    const days = daysUntilOpening(now, relevantSessionYear(now));

    return days > 1 ? { kind: 'untilOpening', days } : { kind: 'openingTomorrow' };
  }
  if (day === 1 && now < sessionOpeningAt(now.getFullYear())) {
    return { kind: 'openingToday' };
  }

  const daysToWomensCarnivalDay = calendarDaysBetween(
    now,
    carnivalDaysOf(sessionAt(now).startYear).womensCarnivalDay,
  );

  if (daysToWomensCarnivalDay >= 1 && daysToWomensCarnivalDay <= WOMENS_CARNIVAL_DAY_REACH) {
    return { kind: 'untilWomensCarnivalDay', days: daysToWomensCarnivalDay };
  }

  return { kind: 'sessionDay', day };
};

const occasionAt = (now: Date, viewer: GreetingViewer): GreetingOccasion => {
  if (isOpeningDay(now)) {
    const msToOpening = sessionOpeningAt(now.getFullYear()).getTime() - now.getTime();

    if (msToOpening <= 0) {
      return { moment: 'carnivalCall', clause: null };
    }
    if (msToOpening <= COUNTDOWN_REACH_MS) {
      return {
        moment: 'openingCountdown',
        secondsToOpening: Math.ceil(msToOpening / MS_PER_SECOND),
        clause: null,
      };
    }
  }
  if (fallsOn(viewer.birthDate, now)) {
    return { moment: 'birthday', clause: seasonClauseAt(now) };
  }
  if (
    viewer.memberSince !== null &&
    RUNNING_STATES.has(viewer.membershipState) &&
    fallsOn(viewer.memberSince, now) &&
    yearsSince(viewer.memberSince, now) >= 1
  ) {
    return {
      moment: 'joinAnniversary',
      years: yearsSince(viewer.memberSince, now),
      clause: seasonClauseAt(now),
    };
  }

  const carnivalMoment = carnivalMomentAt(now);

  if (carnivalMoment !== null) {
    return { moment: carnivalMoment, clause: null };
  }
  if (viewer.appSince === toIsoDay(now)) {
    return { moment: 'welcome', clause: seasonClauseAt(now) };
  }

  return { moment: 'daily', clause: seasonClauseAt(now) };
};

const clauseNumberOf = (clause: SeasonClause | null): number | null => {
  if (clause === null) {
    return null;
  }
  if (clause.kind === 'sessionDay') {
    return clause.day;
  }
  if (clause.kind === 'untilOpening' || clause.kind === 'untilWomensCarnivalDay') {
    return clause.days;
  }

  return null;
};

const showsOrdinal = (moment: GreetingMoment, clause: SeasonClause | null): boolean => {
  if (ORDINAL_MOMENTS.has(moment)) {
    return true;
  }
  if (clause === null || moment === 'joinAnniversary' || clause.kind === 'untilWomensCarnivalDay') {
    return false;
  }
  if (clause.kind === 'openingToday') {
    return moment === 'daily';
  }

  return true;
};

const isRoundYears = (years: number): boolean =>
  ANNIVERSARY_STEPS.some((step) => years % step === 0);

const isFestive = (occasion: GreetingOccasion, ordinal: number | null): boolean => {
  const clauseNumber = clauseNumberOf(occasion.clause);

  return (
    FESTIVE_MOMENTS.has(occasion.moment) ||
    (occasion.moment === 'joinAnniversary' && isRoundYears(occasion.years)) ||
    (clauseNumber !== null && FESTIVE_NUMBERS.has(clauseNumber)) ||
    (ordinal !== null &&
      showsOrdinal(occasion.moment, occasion.clause) &&
      FESTIVE_NUMBERS.has(ordinal))
  );
};

const isNight = (moment: GreetingMoment, now: Date): boolean =>
  moment !== 'openingCountdown' &&
  moment !== 'carnivalCall' &&
  (now.getHours() >= NIGHT_FROM_HOUR || now.getHours() < NIGHT_UNTIL_HOUR);

const ordinalFor = (viewer: GreetingViewer, sessionYear: number): number | null => {
  const session = viewer.relevantSession;

  return session !== null && session.startYear === sessionYear ? session.ordinal : null;
};

export const greetingActAt = (now: Date, viewer: GreetingViewer): GreetingAct => {
  const occasion = occasionAt(now, viewer);
  const sessionYear = relevantSessionYear(now);
  const ordinal = ordinalFor(viewer, sessionYear);

  return {
    ...occasion,
    festive: isFestive(occasion, ordinal),
    night: isNight(occasion.moment, now),
    key: `${occasion.moment}:${toIsoDay(now)}`,
    sessionYear,
    ordinal,
  };
};
