import type { TrainingDraftSearch } from '@/features/calendar/training-draft';
import type { Weekday } from '@/features/groups/group-identity';
import { toClockSpan } from '@/features/groups/group-identity';
import { toIsoDay } from '@/lib/day';
import type { UsualTrainingTime } from './schemas';
import { toClockValue } from './usual-training-time-labels';

const DAYS_PER_WEEK = 7;

const JS_WEEKDAYS: Record<Weekday, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const pad = (value: number): string => String(value).padStart(2, '0');

const clockOf = (moment: Date): string => `${pad(moment.getHours())}:${pad(moment.getMinutes())}`;

interface UsualTimeOccurrence {
  usualTime: UsualTrainingTime;
  day: string;
  start: string;
}

const nextOccurrenceOf = (usualTime: UsualTrainingTime, now: Date): UsualTimeOccurrence => {
  const start = toClockValue(usualTime.startsAt);
  const ahead = (JS_WEEKDAYS[usualTime.weekday] - now.getDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const offset = ahead === 0 && start <= clockOf(now) ? DAYS_PER_WEEK : ahead;
  const day = toIsoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));

  return { usualTime, day, start };
};

const isEarlier = (left: UsualTimeOccurrence, right: UsualTimeOccurrence): boolean =>
  `${left.day}T${left.start}` < `${right.day}T${right.start}`;

export const toNextTrainingDraft = (
  groupId: number,
  usualTimes: readonly UsualTrainingTime[],
  now: Date,
): TrainingDraftSearch => {
  const next = usualTimes
    .map((usualTime) => nextOccurrenceOf(usualTime, now))
    .reduce<UsualTimeOccurrence | null>(
      (earliest, occurrence) =>
        earliest === null || isEarlier(occurrence, earliest) ? occurrence : earliest,
      null,
    );

  if (next === null) {
    return { day: toIsoDay(now), group: groupId, kind: 'training' };
  }

  return {
    day: next.day,
    group: groupId,
    kind: 'training',
    start: next.start,
    end: toClockSpan(next.start, next.usualTime.durationMinutes).to,
    venue: next.usualTime.venueId ?? undefined,
  };
};
