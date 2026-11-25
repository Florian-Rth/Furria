import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';

const SAMPLE_TITLE = 'Training';
const SAMPLE_DAY = '14';
const SAMPLE_WEEKDAY = 'DI';
const SAMPLE_META = '19:00 – 21:00 · Turnhalle';
const SAMPLE_ANSWER = 'yes';

const keepAnswer = (): void => {};

export const HubHelpCalendarPreview: FC = () => {
  const answer = (
    <KkAnswerChoice
      label={SAMPLE_TITLE}
      value={SAMPLE_ANSWER}
      onChange={keepAnswer}
      labels={ATTENDANCE_LABELS}
    />
  );

  return (
    <KkPanel variant="list">
      <KkFactRow
        title={SAMPLE_TITLE}
        span={SAMPLE_DAY}
        spanLabel={SAMPLE_WEEKDAY}
        meta={SAMPLE_META}
        actions={answer}
      />
    </KkPanel>
  );
};
