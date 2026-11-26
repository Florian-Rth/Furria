import { KkStepList } from '@furria/ui/KkStepList';
import type { KkStepState } from '@furria/ui/step-state';
import type { FC } from 'react';
import { PANE_ICONS, PANE_TITLES, STATE_LABELS, STEPS_LABEL } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';

interface SampleStep {
  pane: EventPaneKey;
  state: KkStepState;
  fact: string;
  due?: string;
}

const SAMPLE_STEPS: readonly SampleStep[] = [
  { pane: 'details', state: 'done', fact: 'komplett' },
  { pane: 'tickets', state: 'current', fact: 'VVK-Stelle fehlt', due: 'bis 12.01.' },
  { pane: 'runningOrder', state: 'waiting', fact: 'ab 18.01.' },
];

const keep = (): void => {};

export const EventHelpStepsPreview: FC = () => {
  const steps = SAMPLE_STEPS.map((step) => (
    <KkStepList.Step
      key={step.pane}
      icon={PANE_ICONS[step.pane]}
      title={PANE_TITLES[step.pane]}
      state={step.state}
      stateLabel={STATE_LABELS[step.state]}
      fact={step.fact}
      due={step.due}
      onSelect={keep}
    />
  ));

  return <KkStepList label={STEPS_LABEL}>{steps}</KkStepList>;
};
