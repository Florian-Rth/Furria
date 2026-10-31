import type { Me, PersonFunction } from '@/lib/api/schemas';

export const CLUB_FOUNDED_YEAR = 1971;

const FUNCTIONS_SHOWN = 2;
const ISO_YEAR_END = 4;

const FUNCTION_ORDER: Record<PersonFunction['kind'], number> = {
  boardSeat: 0,
  role: 1,
  groupAdmin: 2,
};

const DATELINE_AT_MS = 250;
const REEL_AT_MS = 600;
const REEL_MS_PER_YEAR = 45;
const REEL_LEAST_MS = 1000;
const REEL_MOST_MS = 2400;
const FOUNDED_AFTER_REEL_START_MS = 200;
const JOINED_AFTER_REEL_MS = 150;
const NAME_AFTER_JOINED_MS = 650;
const LETTER_MS = 65;
const LETTER_LAND_MS = 700;
const LINE_GAP_MS = 420;
const SWEEP_AFTER_LINE_MS = 900;
const SWEEP_AFTER_NAME_MS = 300;
const CALL_INTO_SWEEP_SHARE = 0.55;
const ANSWER_AFTER_CALL_MS = 480;
const ENTER_AFTER_ANSWER_MS = 700;

export type WelcomeJoining =
  | { kind: 'since'; year: number }
  | { kind: 'founding' }
  | { kind: 'now' };

export type WelcomeLine = { kind: 'session'; ordinal: number } | { kind: 'function'; name: string };

export interface WelcomeBeats {
  dateline: number;
  reel: number;
  reelMs: number;
  founded: number;
  joined: number;
  name: number;
  letterMs: number;
  lines: number[];
  sweep: number;
  call: number;
  answer: number;
  enter: number;
}

export interface WelcomePlan {
  firstName: string;
  joining: WelcomeJoining;
  reelYears: number[];
  lines: WelcomeLine[];
  beats: WelcomeBeats;
}

export interface WelcomeMember {
  firstName: string;
  memberSince: string | null;
  sessionOrdinal: number | null;
  functions: readonly PersonFunction[];
}

const joinYearOf = (memberSince: string | null): number | null =>
  memberSince === null ? null : Number(memberSince.slice(0, ISO_YEAR_END));

const joiningOf = (joinYear: number | null): WelcomeJoining => {
  if (joinYear === null) {
    return { kind: 'now' };
  }

  return joinYear <= CLUB_FOUNDED_YEAR ? { kind: 'founding' } : { kind: 'since', year: joinYear };
};

const reelYearsOf = (joining: WelcomeJoining): number[] => {
  const last = joining.kind === 'since' ? joining.year : CLUB_FOUNDED_YEAR;

  return Array.from(
    { length: last - CLUB_FOUNDED_YEAR + 1 },
    (_, index) => CLUB_FOUNDED_YEAR + index,
  );
};

const linesOf = (member: WelcomeMember): WelcomeLine[] => {
  const session: WelcomeLine[] =
    member.sessionOrdinal === null ? [] : [{ kind: 'session', ordinal: member.sessionOrdinal }];
  const held = [...member.functions]
    .sort((first, second) => FUNCTION_ORDER[first.kind] - FUNCTION_ORDER[second.kind])
    .slice(0, FUNCTIONS_SHOWN)
    .map((entry): WelcomeLine => ({ kind: 'function', name: entry.name }));

  return [...session, ...held];
};

const reelMsOf = (years: number): number =>
  years <= 1 ? 0 : Math.min(Math.max(years * REEL_MS_PER_YEAR, REEL_LEAST_MS), REEL_MOST_MS);

const beatsOf = (
  firstName: string,
  reelYears: readonly number[],
  lineCount: number,
  sweepMs: number,
): WelcomeBeats => {
  const reelMs = reelMsOf(reelYears.length);
  const joined = REEL_AT_MS + reelMs + JOINED_AFTER_REEL_MS;
  const name = joined + NAME_AFTER_JOINED_MS;
  const nameLanded = name + Array.from(firstName).length * LETTER_MS + LETTER_LAND_MS;
  const lines = Array.from({ length: lineCount }, (_, index) => nameLanded + index * LINE_GAP_MS);
  const lastLine = lines.at(-1);
  const sweep =
    lastLine === undefined ? nameLanded + SWEEP_AFTER_NAME_MS : lastLine + SWEEP_AFTER_LINE_MS;
  const call = sweep + Math.round(sweepMs * CALL_INTO_SWEEP_SHARE);
  const answer = call + ANSWER_AFTER_CALL_MS;

  return {
    dateline: DATELINE_AT_MS,
    reel: REEL_AT_MS,
    reelMs,
    founded: REEL_AT_MS + FOUNDED_AFTER_REEL_START_MS,
    joined,
    name,
    letterMs: LETTER_MS,
    lines,
    sweep,
    call,
    answer,
    enter: answer + ENTER_AFTER_ANSWER_MS,
  };
};

export const welcomePlanOf = (member: WelcomeMember, sweepMs: number): WelcomePlan => {
  const joining = joiningOf(joinYearOf(member.memberSince));
  const reelYears = reelYearsOf(joining);
  const lines = linesOf(member);

  return {
    firstName: member.firstName,
    joining,
    reelYears,
    lines,
    beats: beatsOf(member.firstName, reelYears, lines.length, sweepMs),
  };
};

export const welcomeMemberOf = (me: Me): WelcomeMember | null =>
  me.person === null
    ? null
    : {
        firstName: me.person.firstName,
        memberSince: me.membership.memberSince,
        sessionOrdinal: me.membership.relevantSession?.ordinal ?? null,
        functions: me.honours.functions,
      };

export const owedWelcomeOf = (me: Me): WelcomeMember | null =>
  me.welcomeSeenAt === null ? welcomeMemberOf(me) : null;
