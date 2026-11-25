import { KkTimeField } from '@furria/ui/KkTimeField';
import type { FC } from 'react';

const FIELD_NAME = 'help-event-start';
const START_LABEL = 'Beginn';
const SAMPLE_START = '20:11';
const QUICK_TIMES = ['14:11', '20:11', '21:11'] as const;

const keep = (): void => {};

export const EventEditorHelpTimesPreview: FC = () => (
  <KkTimeField
    name={FIELD_NAME}
    label={START_LABEL}
    value={SAMPLE_START}
    onChange={keep}
    quickTimes={QUICK_TIMES}
  />
);
