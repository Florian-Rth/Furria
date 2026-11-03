import { KkWeekRhythm } from '@furria/ui/KkWeekRhythm';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import type { UsualTrainingTime } from '../schemas';
import { toWeekRhythm, WEEK_RHYTHM_LABEL } from '../week-rhythm';

interface HubWeekRhythmProps {
  tone: GroupTone;
  usualTimes: readonly UsualTrainingTime[];
}

export const HubWeekRhythm: FC<HubWeekRhythmProps> = ({ tone, usualTimes }) => {
  const days = toWeekRhythm(usualTimes).map((day, index) => (
    <KkWeekRhythm.Day
      key={day.weekday}
      weekday={day.short}
      label={day.label}
      times={day.times}
      tone={tone}
      index={index}
    />
  ));

  return <KkWeekRhythm label={WEEK_RHYTHM_LABEL} days={days} />;
};
